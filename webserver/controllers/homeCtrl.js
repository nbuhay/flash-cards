var http = require('http');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.loadUserHome = function (req, res, next) {
	var options = {
		port: 3000,
		path: '/api/user/Bu'
	};

	callback = function (response) {
		var str = '';
		response.on('data', function (chunk) {
			str += chunk;
		});

		// send back data into function next
		response.on('end', function () {
			next(JSON.parse(str));
		});
	}

	http.request(options, callback).end();
}