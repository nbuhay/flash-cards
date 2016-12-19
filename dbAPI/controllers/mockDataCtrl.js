var http = require('http');
var CONST = require('../../global');
var mongoose = require('mongoose');
var mockDecks = require('../../mockData/decks').decks;
var mockUsers = require('../../mockData/users').users;
var Deck = require('../models/deck');
var User = require('../models/user');
var jsonRes = require('../modules/jsonResponse');

var DECK_REQ_OPTS = {
	port: CONST.PORT(),
	path: '/api/deck/name/' + mockDecks[CONST.TEST_DECK()].name
};

var USER_REQ_OPTS = {
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
					jsonRes.send(res, CONST.RES('SERVFAIL'), 'Error importing all mock users');
				} else {
					console.log('user' + count + ' saved!');
					if (++count == mockUsers.length) {
						jsonRes.send(res, CONST.RES('OK'), {msg: 'All users saved!'});
					}
				}
			});
		});
	});
}

module.exports.insertDecks = (req, res) => {
	// Clear old dummy data
	mongoose.connection.db.dropCollection('decks', () => {
		console.warn('decks table droped!');
		console.log('inserting mock decks...');
		var count = 0;
		// save all mock decks
		mockDecks.map((deck) => {
			var tmpDeck = new Deck(deck);
			tmpDeck.save((err) => {
				if (err) {
					jsonRes.send(res, CONST.RES('SERVFAIL'), 'Error importing all mock decks');
				} else {
				console.log('deck' + count + ' saved!');
				if(++count == mockDecks.length) {
					jsonRes.send(res, CONST.RES('OK'), {msg: 'All decks saved!'});
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
		var defaultDeck = new Deck(mockDecks[CONST.TEST_DECK()]);

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
							var defaultUser = new User(mockUsers[CONST.TEST_USER()]);

							// Associate dummy data
							defaultUser.decks.created.push((JSON.parse(str))._id);

							// callback only called when request hears a response event
							var callback = function (response) {
								jsonRes.send(res, CONST.RES('OK'), {'MockDataLoaded':  true});	
							};

							// setup the POST request
							var request = http.request(USER_REQ_OPTS, callback);

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

					http.request(DECK_REQ_OPTS, callback).end();
				});
			}
		});
	});
};