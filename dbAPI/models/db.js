var config = require('../../global').config();
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(config.dbURI);

var db = mongoose.connection;

// Log MongoDB connection activity
db.on('connected', () => console.log('\tMongoose connected to ' + config.dbURI));
db.on('error', (err) => console.log('\tMongoose connection error: ' + err));
db.on('disconnected', () => console.log('\tMongoose disconnected'));

// close MongoDB connections
var gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

// listen for and close db connectivity on thrown signals
process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', function () {
        process.kill(process.pid, 'SIGUSR2');
    });
});
process.on('SIGINT', function () {
    gracefulShutdown('app termination', function () {
        process.exit(0);
    });
});
process.on('SIGTERM', function () {
    gracefulShutdown('Heroku app shutdown', function () {
        process.exit(0);
    });
});

require('./deck');
require('./user');
require('./card');
