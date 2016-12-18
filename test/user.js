var mongoose = require('mongoose');
var mockUsers = require('../mockData/users').users;
var mockDecks = require('../mockData/decks').decks;
var User = require('../dbAPI/models/user');
var assert = require('assert');
var http = require('http');

var DEFAULT_PORT = 3000;
var DEFAULT_USER = 0;
var DEFAULT_DECK = 0;

describe('User Model', () => {

	// arrow functions
	describe('POST /api/user', () => {
		it('should get a 200 response', (done) => {
			var options = {
				port: DEFAULT_PORT,
				path: '/api/user',
				method: 'POST'
			};
			var req = http.request(options, res => {
				assert(res.statusCode == 200);
				done();
			});
			req.write(JSON.stringify(mockUsers[DEFAULT_USER]));
			req.end();
		});
	});

	describe('GET /api/user/name/' + mockUsers[DEFAULT_USER].userName, () => {
		it('should GET User user with user.userName == ' + mockUsers[DEFAULT_USER].userName, (done) => {
			var options = {
				port: DEFAULT_PORT,
				path: '/api/user/name/' + mockUsers[DEFAULT_USER].userName
			};
			var resStr = '';
			var callback = function (response) {
				response.on('data', function (chunk) {
					resStr += chunk;
				});
				response.on('end', function () {
					assert(JSON.parse(resStr).userName == mockUsers[DEFAULT_USER].userName);
					done();
				});
			};
			http.request(options, callback).end();
		});
	});

	describe('POST /api/user/:nameUser/learning/:deck_id', () => {
		it('should POST new Deck into user.decks.learning', (done) => {
			// need deck._id, setup GET by deck.name
			var options = {
				port: DEFAULT_PORT,
				path: '/api/deck/name/' + mockDecks[DEFAULT_DECK].name
			};
			var callback = function (response) {
				var deck = '';
				response
					.on('data', (chunk) => {
						deck += chunk;
					})
					.on('end', () => {
						// got deck, setup options using deck._id
						var options = {
							port: DEFAULT_PORT,
							path: '/api/user/' + mockUsers[DEFAULT_USER].userName + '/learning/' + (JSON.parse(deck))._id,
							method: 'POST'
						};
						// setup request
						//   callback called when 'response' event is triggered
						//   'response' event is only triggered one time
						//     triggered on response back form server you POSTed to
						var request = http.request(options, (response) => {
							assert(response.statusCode == 200);
							done();
						});
						request.on('error', (e) => {
							console.log('There was an error' + e);
							console.log('err.stack: ' + e.stack);
							assert(true == false);
							done();
						});
						request.end();
					});
			};
			http.request(options, callback).end();
		});
	});

});