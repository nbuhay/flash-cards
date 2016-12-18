var CONST = require('../../global');
var http = require('http');
var mongoose = require('mongoose');
var mockUsers = require('../../mockData/users').users;
var mockDecks = require('../../mockData/decks').decks;
var User = require('../models/user');
var Deck = require('../models/deck');
var jsonRes = require('../modules/jsonResponse');

var DEFAULT_DECK = 0;
var DEFAULT_DECK_REQ_OPTS = {
	port: CONST.PORT(),
	path: '/api/deck/name/' + mockDecks[DEFAULT_DECK].name
};
var DEFAULT_USER = 0;
var DEFAULT_USER_REQ_OPTS = {
	port: CONST.PORT(),
	path: '/api/user',
	method: 'POST'
};

module.exports.insertUsers = (req, res) => {
	// Clear old dummy data
	mongoose.connection.db.dropCollection('users', () => {
		console.warn('users table dropped!');

		console.log('inserting mock users...');
		var count = 0;
		// save all mock users
		mockUsers.map((user) => {
			var tmpUser = new User(user);
			tmpUser.save((err) => {
				if (err) {
					jsonRes.send(res, 500, 'Error importing all mock users');
				} else {
					console.log('user'+ count + ' saved!');
					if (++count == mockUsers.length) {
						jsonRes.send(res, 200, 'All users saved!');
					}
				}
			});
		});
	});
}

// Clear old dummy data:  VERY DESTRUCTIVE
// Create dummy data:  one user and one deck
// Associate dummy data:  user has created deck
// Save data to mongoDb
module.exports.insert = function (req, res) {

	// Clear old dummy data
	mongoose.connection.db.dropCollection('decks', function () {
		console.warn('Decks dropped');

		// Create dummy data
		var defaultDeck = new Deck(mockDecks[DEFAULT_DECK]);

		// Save deck to mongoDb
		defaultDeck.save(function (err) {
			if (err) { 
				console.error('Error saving defaultDeck') 
			} else {

				// Clear old dummy data
				mongoose.connection.db.dropCollection('users', function () {
					console.warn('Users dropped');

					// Associate dummy data
					var callback = function (response) {
						var str = '';
						response.on('data', function (chunk) {
							str += chunk;
						});
						response.on('end', function () {

							// ned to send response using original req/res

							// Create dummy data
							var defaultUser = new User(mockUsers[DEFAULT_USER]);

							// Associate dummy data
							defaultUser.decks.created.push((JSON.parse(str))._id);

							// callback only called when request hears a response event
							var callback = function (response) {
								jsonRes.send(res, 200, {'MockDataLoaded':  true});	
							};

							// setup the POST request
							var request = http.request(DEFAULT_USER_REQ_OPTS, callback);

							// listen for POST error
							req.on('error', (e) => {
								console.log('There was an error with the request');
								console.log(e);
							});

							// post the data i.e. save user to mongoDb
							request.write(JSON.stringify(defaultUser));
							request.end();
						});
					}

					http.request(DEFAULT_DECK_REQ_OPTS, callback).end();
				});
			}
		});
	});
};