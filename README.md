mongoose-harmony-gridfs
=======================

Mongoose plugin for GridFS based on ES6 Harmony

## Purpose
Store large documents in a MongoDB database using Mongoose with a painless syntax. This project should only be used with generator heavy projects, such as Koa projects.

## Usage
```javascript
var mongoose = require('mongoose'),
    plugin = require('mongoose-harmony-gridfs')

var schema = mongoose.Schema({
    name: String,
    joinedOn: Date
});

var settings = {
    keys: ['photo', 'thumbnail']
};

ProfileSchema.plugin(plugin, settings); // Attach GridFS
var Profile = module.exports = mongoose.model('Profile', schema); // Ready to use GridFS
```
### Initial setup
#### Schema setup
You must attach this plug-in to your schema in order to begin using GridFS. This is necessary because the plug-in needs to know what keys you will be using as document storage. Once the plug-in has been attached, all new instances will contain GridFS functionality.

```javascript
var user = new Profile() // Has GridFS functionality
```

Please be wary of key usage. Your original schema **should not contain the same keys as the ones included in the plug-in**.

#### Settings
* `key`: Array of strings that determine what keys will be used by the plug-in. Without this option, the plug-in will do nothing.
* `bucket`: String that determines what GridFS repository should be used. By default it is `'fs'`.
* `linkPropertyName`: String that determines what the property that is responsible for linking files will be named. By default it is `'_gfs'`.

### CRUD operations
#### Saving
Once you've created a new instance, you can start saving buffers right away.
```javascript
var user = new Profile()
var data = "This is a random string!"
user.photo = new Buffer(data) // This sends document information immediately to the database
```
Information is sent to the database immediately. Any existing information that was previously stored in the database is removed and replaced with the new buffer.

#### Loading
If you can yield values because you are calling from a generator, you can yield for a database value. This will return a buffer with all contents in the file.
```javascript
var photo = yield user.photo;
```
If you need to provide error handling, you can wrap this statement in a try/catch.
```javascript
var photo;
try {
    photo = yield user.photo;
} catch (err){
    // Do something with the error
}
```
If you are operating within a function, you can use Q's done function to retrieve the information in a callback. Similarly, you can use the fail function to catch errors.
```javascript
var promise = user.photo;
var photo;
promise.done(function(data){
    photo = data;
}).fail(function(err){
    throw err;
});
```
## Future development
There are plans to extend this plug-in to include the ability to read streams of files and to be able to gather and store metadata. If this is something that interests you, feel free to fork and open a pull request. I will also need tests and those should be coming soon.
