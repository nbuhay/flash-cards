var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var mockUsers = require('../../mockData/users').users;
var mockDecks = require('../../mockData/decks').decks;
var User = require('../models/user');
var Deck = require('../models/deck');
var jsonRes = require('../modules/jsonResponse');

var DEFAULT_DECK = 1;
var DEFAULT_DECK_REQ_OPTS = {
	port: 3000,
	path: '/api/deck/name/' + mockDecks[DEFAULT_DECK].name
}
var DEFAULT_USER = 0;

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

							// Create dummy data
							var defaultUser = new User(mockUsers[DEFAULT_USER]);

							// Associate dummy data
							defaultUser.decks.created.push((JSON.parse(str))._id);

							// Save user to mongoDb
							defaultUser.save(function (err) {
								if (err) { 
									console.log('Error Saving defaultUser');
									res.status(500);
								} else {
									console.log('defaultUser saved')
									jsonRes.send(res, 200, 'Mock User Creation Successful');
								}
							});
						});
					};

					http.request(DEFAULT_DECK_REQ_OPTS, callback).end();
				});
			}
		});
	});
};