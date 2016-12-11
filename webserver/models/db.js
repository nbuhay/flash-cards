var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/test';

mongoose.connect(dbURI);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log("Connected to " + dbURI);
});

db.close(function () {
	console.log("We're closed");
});

require('./deck');
require('./user');
