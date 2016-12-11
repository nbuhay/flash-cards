var http = require('http');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.getTestUser = function(req, res) {
	var bu = new User({
		userName: 'Bu',
		pswd: 'abc123',
		email: 'nichobu@flash.com',
		zip: 55555,
		decks: {
			created: ['a', 'b', 'c'],
			fav: ['d', 'e', 'f']
		}
	});

	// take deck _id, get the deck name, return that only

	return bu;
};

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