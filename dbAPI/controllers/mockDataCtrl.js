var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var mockUsers = require('../../mockData/users');
var User = require('../models/user');
var Deck = require('../models/deck');
var jsonRes = require('../modules/jsonResponse');

// Clear old dummy data:  VERY DESTRUCTIVE
// Create dummy data:  one user and one deck
// Associate dummy data:  user has created deck
// Save data to mongoDb
module.exports.insert = function (req, res) {
	// Clear old dummy data
	mongoose.connection.db.dropCollection('decks', function () {
		console.warn('Decks dropped');

		// Create dummy data
		var defaultDeck = new Deck({
			name: 'Harmony',
			description: 'New learnings from Harmony book.',
			tags: ['music theory', 'composition'],
			cards: [
				{
					question: 'What tones are in a triad?',
					answer: 'Tonic, mediant, dominant'
				},
				{
					question: 'Who is Chopin?',
					answer: 'Solo pianist.'
				},
				{
					question: 'What is your favorite color?',
					answer: 'Green.'
				}
			],
			favs: 1
		});

		// Save deck to mongoDb
		defaultDeck.save(function (err) {
			if (err) { 
				console.error('Error saving defaultDeck') 
			} else {
				// Clear old dummy data
				mongoose.connection.db.dropCollection('users', function () {
					console.warn('Users dropped');

					// get deck doc
					var options = {
						port: 3000,
						path: '/api/deck/name/Harmony'
					};

					// Associate dummy data
					http.request(options, function (response) {
						var str = '';
						response.on('data', function (chunk) {
							str += chunk;
						});
						response.on('end', function () {
							// Create dummy data
							var defaultUser = new User({
								userName: 'Bu',
								pswd: 'abc123',
								email: 'nichobu@flash.com',
								zip: 55555,
								decks: {
									// Associate dummy data
									created: [(JSON.parse(str))._id]
								}
							});
							// Save user to mongoDb
							defaultUser.save(function (err) {
								if (err) { 
									console.log('Error Saving defaultUser');
									res.status(500);
								} else {
									console.log('defaultUser saved')
									jsonRes.send(res, 200, 'db api');
								}
							});
						});
					}).end();
				});
			}
		});
	});
};