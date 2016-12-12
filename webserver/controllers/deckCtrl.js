var http = require('http');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Deck = mongoose.model('Deck');

module.exports.loadDeck = function (req, res, next) {
	var options = {
		port: 3000,
		path: '/api/user/name/Bu'
	};

	var user = '';

	var callback = function (response) {
		response.on('data', function (chunk) {
			user += chunk;
		});

		response.on('end', function () {
			var options = {
				port: 3000,
				path: '/api/deck/id/'+(JSON.parse(user)).decks.created[0]
			};

			var deck = '';

			var callback = function (response) {
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
};