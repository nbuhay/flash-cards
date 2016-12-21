var CONST = require('../global.js');
var mongoose = require('mongoose');
var mockUsers = require('../mockData/users').users;
var mockDecks = require('../mockData/decks').decks;
var User = require('../dbAPI/models/user');
var assert = require('assert');
var http = require('http');

describe('User Model', () => {

	describe('GET /api/user', () => {
		it('should GET all Users', (done) => {
			var options = {
				port: CONST.PORT(),
				path: '/api/user'
			};
			var callback = (response) => {
				var users = '';
				response
					.on('data', (chunk) => {
						users += chunk;
					})
					.on('end', () => {
						assert((JSON.parse(users)).length == mockUsers.length);
						done();
					});
			};
			http.request(options, callback).end();
		});
	});

	describe('POST /api/user', () => {
		it('should get a 200 response', (done) => {
			var options = {
				port: CONST.PORT(),
				path: '/api/user',
				method: 'POST'
			};
			var req = http.request(options, res => {
				assert(res.statusCode == 200);
				done();
			});
			req.write(JSON.stringify(mockUsers[CONST.TEST_USER()]));
			req.end();
		});
	});

	describe('GET /api/user/name/:userName', () => {
		it('should GET User user with user.userName == :userName', (done) => {
			var options = {
				port: CONST.PORT(),
				path: '/api/user/name/' + mockUsers[CONST.TEST_USER()].userName
			};
			var resStr = '';
			var callback = function (response) {
				response.on('data', function (chunk) {
					resStr += chunk;
				});
				response.on('end', function () {
					assert(JSON.parse(resStr).userName == mockUsers[CONST.TEST_USER()].userName);
					done();
				});
			};
			http.request(options, callback).end();
		});
	});

	describe('GET /api/user/_id/:_id', () => {
		it('should GET User user with user._id == :_id', (done) => {
			var options = {
				port: CONST.PORT(),
				path: '/api/user/name/' + mockUsers[CONST.TEST_USER()].userName
			};
			var callback = (response) => {
				var user = '';
				response
					.on('data', (chunk) => {
						user += chunk;
					})
					.on('end', () => {
						var options = {
							port: CONST.PORT(),
							path: '/api/user/_id/' + (JSON.parse(user))._id
						};
						var callback = (response) => {
							var user = '';
							response
								.on('data', (chunk) => {
									user += chunk;
								})
								.on('end', () => {
									assert(response.statusCode == CONST.RES('OK'));
									done();
								});
						};
						http.request(options, callback).end();
					});
			};
			http.request(options, callback).end();
		});
	});

	describe('PUT /api/user/_id/:_id', () => {
		it('should update User user where user._id == :_id', (done) => {
			var newUserName = 'Test';
			var newZip = 00000;
			var options = {
				port: CONST.PORT(),
				path: '/api/user/name/' + mockUsers[CONST.TEST_USER()].userName
			};
			var callback = (response) => {
				var user = '';
				response
					.on('data', (chunk) => {
						user += chunk;
					})
					.on('end', () => {
						var userJson = JSON.parse(user);
						userJson.userName = newUserName;
						userJson.zip = newZip;
						var options = {
							port: CONST.PORT(),
							path: '/api/user/_id/' + userJson._id,
							method: 'PUT',
							headers: {
				        'Content-Type': 'application/json'
				        'Content-Length': Buffer.byteLength(JSON.stringify(userJson))
				      }
						};
						var request = http.request(options, (response) => {
							assert(response.statusCode == CONST.RES('OK'));
							done();
						});
						request
							.on('error', (err) => {
								assert(true == false);
								done();
							});
						request.write(JSON.stringify(userJson));
						request.end();
					});
			}
			http.request(options, callback).end();
		});
	});

	describe('POST /api/user/:nameUser/learning/:deck_id', () => {
		it('should POST new Deck into user.decks.learning', (done) => {
			// need deck._id, setup GET by deck.name
			var options = {
				port: CONST.PORT(),
				path: '/api/deck/name/' + mockDecks[CONST.TEST_DECK()].name
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
							port: CONST.PORT(),
							path: '/api/user/' + mockUsers[CONST.TEST_USER()].userName + '/learning/' + (JSON.parse(deck))._id,
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

	describe('DELETE /api/user/_id/:_id', () => {
		it('should delete User user with user._id==:_id', (done) => {
			var options = {
				port: CONST.PORT(),
				path: '/api/user/name/' + mockUsers[CONST.TEST_USER()].userName
			};
			var callback = (response) => {
				var user = '';
				response
					.on('data', (chunk) => {
						user += chunk;
					})
					.on('end', () => {
						var options = {
							port: CONST.PORT(),
							path: '/api/user/_id/' + (JSON.parse(user))._id,
							method: 'DELETE'
						};
						var request = http.request(options, (response) => {
							assert(response.statusCode == CONST.RES('OK'));
							done();
							});
						request
							.on('error', (e) => {
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