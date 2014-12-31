'use strict';

function mongooseFS(schema, options){
  var mongoose          = options.mongoose || require('mongoose');
  var bucket            = options.bucket || 'fs';
  var Q                 = require('q');
  var linkPropertyName  = options.linkPropertyName || '_gfs';
  var gfsSchema         = {};
  var Grid              = mongoose.mongo.Grid;
  var GridStore         = mongoose.mongo.GridStore;
  var ObjectId          = mongoose.Schema.ObjectId;

  schema.set("strict", true);

  gfsSchema[linkPropertyName] = {};
  options.keys.forEach(function(key){
    gfsSchema[linkPropertyName][key] = ObjectId;
  });

  schema.add(gfsSchema);

  options.keys.forEach(function(key){
    schema.virtual(key).get(function(){
      var id      = this.get(linkPropertyName + '.' + key);
      var gridFS  = Grid(mongoose.connection.db, bucket);              

      return Q.Promise(function(resolve, reject){
        if (id == null) return resolve(null);

        gridFS.get(id, function(err, buffer){
          if (err) resolve(null);
          else resolve(buffer);
        });
      });
    });
    schema.virtual(key).set(function(value){
      var self      = this;
      var gridFS    = Grid(mongoose.connection.db);
      var buffer    = new Buffer(value.buffer);
      var previous  = this.get(linkPropertyName + '.' + key);

      if (previous !== undefined)
        gridFS.delete(previous, function(err){
          if (err) throw err;
        });

      gridFS.put(buffer, {
        content_type: 'application/octet-stream',
        metadata: value.metadata
      }, function(err, info){
        if (err) throw err;
        self.set(linkPropertyName + '.' + key, info._id);
        self.save();
      });         
    });
  });

  schema.methods.metadata = function (key){
    var id = this.get(linkPropertyName + '.' + key);
    var gridFS = GridStore(mongoose.connection.db, id);

    return Q.promise(function(resolve, reject){
      gridFS.open(function(err, gridStore){
        resolve(gridStore.metadata);
        gridStore.close();
      });
    });
  }
}

exports = module.exports = mongooseFS;
