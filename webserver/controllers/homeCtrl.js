var http = require('http');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.loadUserHome = function (req, res, next) {
	var options = {
		port: 3000,
		path: '/api/user/name/Bu'
	};

	callback = function (response) {
		var user = '';
		response.on('data', function (chunk) {
			user += chunk;
		});

		// send back data into function next
		response.on('end', function () {

			var options = {
				port: 3000,
				path: '/api/deck/id/'+(JSON.parse(user)).decks.created[0]
			};

			callback = function (response) {
				var deck = '';
				response.on('data', function (chunk) {
					deck += chunk;
				});
				response.on('end', function () {
					var createdDecks = [];
					createdDecks.push(JSON.parse(deck));
					next({
						user: JSON.parse(user),
						decks: { created: createdDecks }
					});
				});
			}
			http.request(options, callback).end();
		});
	}
	http.request(options, callback).end();
}