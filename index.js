'use strict';

module.exports = function(schema, options){
    var mongoose = options.mongoose || require('mongoose'),
        bucket = options.bucket || 'fs',
        Q = require('q'),
        linkPropertyName = options.linkPropertyName || '_gfs',
        gfsSchema = {},
        Grid = mongoose.mongo.Grid,
        ObjectId = mongoose.Schema.ObjectId;

    schema.set("strict", true);

    gfsSchema[linkPropertyName] = {};
    options.keys.forEach(function(key){
        gfsSchema[linkPropertyName][key] = ObjectId;
    });

    schema.add(gfsSchema);

    options.keys.forEach(function(key){
        schema.virtual(key).get(function(){
            var id = this.get(linkPropertyName + '.' + key),
                gridFS = new Grid(mongoose.connection.db, bucket);              

            return Q.Promise(function(resolve, reject, notify){
                gridFS.get(id, function(err, buffer){
                    if (err) reject(err);
                    resolve(buffer);
                });
            });
        });
        schema.virtual(key).set(function(value){
            var self = this,
                gridFS = new Grid(mongoose.connection.db),
                buffer = new Buffer(value),
                previous = this.get(linkPropertyName + '.' + key);

            if (previous !== undefined)
                gridFS.delete(previous, function(err){
                    if (err) throw err;
                });

            gridFS.put(buffer, {content_type: 'application/octet-stream'}, 
                function(err, info){
                    self.set(linkPropertyName + '.' + key, info._id);
                    self.save();
                });         
        })
    });
}