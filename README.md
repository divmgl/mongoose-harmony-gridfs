mongoose-harmony-gridfs
=======================

Mongoose plugin for GridFS based on ES6 Harmony

## Purpose
Store large documents in a MongoDB database using Mongoose with a painless syntax. This project should only be used with generator heavy projects, such as Koa projects.

**This project will only work with Node >0.11.**

## Installation

You can download this plug-in through NPM.

```node
npm install mongoose-harmony-gridfs 
```

## Usage

You must attach this plug-in to your schema to begin using GridFS. Once the plug-in has been attached, all new schema instances will contain GridFS functionality.

```javascript
var mongoose = require('mongoose');
var plugin   = require('mongoose-harmony-gridfs');

var profileSchema = mongoose.Schema({
    name: String,
    joinedOn: Date
});

var settings = {
    // These are the keys that will be stored in GridFS
    keys: ['photo', 'thumbnail']
};

profileSchema.plugin(plugin, settings); // Attach GridFS
var Profile = mongoose.model('Profile', profileSchema); // Ready to use GridFS

var user = new Profile() // Has GridFS functionality

```

You can now access GridFS stores by using the keys you've set up in your schema.

```javascript
var photo = yield user.photo;
```

Please be wary of key usage. Your original schema **should not contain the same keys as the ones included in the plug-in**.

## Settings
* `key`: Array of strings that determine what keys will be used by the plug-in. Without this option, the plug-in will do nothing.
* `bucket`: String that determines what GridFS repository should be used. By default it is `'fs'`.
* `linkPropertyName`: String that determines what the property that is responsible for linking files will be named. By default it is `'_gfs'`.

## CRUD operations
### Saving
Once you've created a new instance, you can start saving buffers right away.
```javascript
var user = new Profile()
var data = "This is a random string!";
user.photo = { buffer: data }; // This sends document information immediately to the database
```
Information is sent to the database immediately. This plug-in will convert all data in the `buffer` property to a buffer that can be written to a GridFS store. Any existing information that was previously stored in the database is removed and replaced with the new buffer.

You can also store metadata regarding your file when saving to the database.

```javascript
var data = { buffer: "This is a random string!", metadata: { user: "mike", id: 23415 } };
user.photo = data;
```

### Loading
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
If you have stored metadata with your file, you can retrieve metadata information by using the `metadata(key)` method, which also returns a Q promise.
```javascript
var metadata = yield user.metadata('photo');
```
