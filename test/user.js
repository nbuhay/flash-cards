const config = require('../global').config();
const resCode = require('../global').resCode();
const testDeck = require('../global').testDeck();
const testUser = require('../global').testUser();
const server = require('../bin/www').server();
var assert = require('chai').assert;
var http = require('http');
var mongoose = require('mongoose');
var mockDecks = require('../global').mockDecks();
var mockUsers = require('../global').mockUsers();

describe('User Model', () => {

	before((done) => {
		console.log('    Before Tests');
		require('../bin/www');
		// db ceremony...
		// make sure connection is established
		mongoose.connection.once('connected', () => {
			var promise = new Promise((resolve, reject) => {
				// cleanse the db
				mongoose.connection.db.dropDatabase(() => {
					console.log('\tMongoose.connection.db.dropDatabase:success');
					resolve();
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// mockUsers[i]._id casted to Mongo ObjectId type
					for (var i = 0; i < mockUsers.length; i++) {
						mockUsers[i]._id = mongoose.Types.ObjectId(mockUsers[i]._id);
					}
					// drop the user collection
					mongoose.connection.collection('users').insert(mockUsers, (err, users) => {
						if (err) reject('mongoose.connection.collection(\'users\').insert:error: ' + err);
						console.log('\tMongoose.connection.collection(\'users\').insertedCount:%s', users.insertedCount);
						resolve();
					});
				});
			})
			.then(() => {
				// mockDecks[i]._id casted to Mongo ObjectId type
				for (var i = 0; i < mockDecks.length; i++) {
					mockDecks[i]._id = mongoose.Types.ObjectId(mockDecks[i]._id);
				}
				// drop the deck collection
				mongoose.connection.collection('decks').insert(mockDecks, (err, decks) => {
					if (err) reject('mongoose.connection.collection(\'decks\').insert:error: ' + err);
					console.log('\tMongoose.connection.collection(\'decks\').insertedCount:%s', decks.insertedCount);
					done();
				});
			})
			.then(undefined, (rejectValue) => {
				console.log('\tbefore.%s', rejectValue);
			});
		});
	});

	after(() => {		
		console.log('   After Tests');
		console.log('\tClosing server...');
		server.close((err, data) => (err) ? console.log('Error:' + err) : console.log('\tServer Closed'));		
	});

	describe('GET /api/users', () => {
		it('should return all Users inserted from mockUsers', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.port,
					path: '/api/users'
				};
				var callback = (res) => {
					var users = '';
					res
						.on('data', (chunk) => users += chunk)
						.on('end', () => {
							try {
								assert.equal(res.statusCode, resCode['OK'], 'badStatusCode: ' + res.statusCode);
							} catch (err) {
								reject(err);
							}
							resolve(JSON.parse(users));
						});
				};
			var req = http.request(options, callback);
			req.on('error', (err) => reject({ message: 'reqError: ' + err }));
			req.end();
			})
			.then((resolveValue) => assert.lengthOf(resolveValue, mockUsers.length))
			.then(undefined, (rejectValue) => assert(false, rejectValue.message));
		});
	});

	describe('POST /api/user', () => {
		it('should save new User to the db', () => {
			var mockUser = {
				_id: mongoose.Types.ObjectId("000000000000000000000003"),
				userName: 'MockUser',
				pswd: '123123',
				email: {
					domainId: 'mock',
					domain: 'mock',
					extension: 'mock'
				},
				zip: 33333,
				decks: {
					created: [],
					learning: []
				}
			};
			return new Promise((resolve, reject) => {
				var options = {
					port: config.port,
					path: '/api/user',
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(JSON.stringify(mockUser))
					}
				};
				var req = http.request(options, (res) => {
					try {
						assert.equal(res.statusCode, resCode['OK'], 'badStatusCode: ' + res.statusCode);
					} catch (err) {
						reject(err);
					}
					resolve();
				});
				req.on('error', (err) => reject({ message: 'reqError: ' + err }));
				req.write(JSON.stringify(mockUser));
				req.end();
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.port,
						path: '/api/user/_id/' + mockUser._id
					};
					var req = http.request(options, (res) => {
						var user = '';
						res
							.on('data', (chunk) => user += chunk)
							.on('end', () => {
								try {
									assert.equal(res.statusCode, resCode['OK'], 'badStatusCode: ' + res.statusCode);
								} catch (err) {
									reject(err);
								}
								resolve(JSON.parse(user));
							});
					});
					req.on('error', (err) => reject({ message: 'reqError: ' + err }));
					req.end();
				});
			})
			.then((user) => {
				assert.equal(user._id, mockUser._id)
			})
			.then(undefined, (reason) => assert(false, reason.message));

		});
	});

	describe('GET /api/user/_id/:_id', () => {
		it('should return User user with user._id == :_id', (done) => {
			var options = {
				port: config.port,
				path: '/api/user/name/' + mockUsers[testUser].userName
			};
			var callback = (response) => {
				var user = '';
				response
					.on('data', (chunk) => {
						user += chunk;
					})
					.on('end', () => {
						var options = {
							port: config.port,
							path: '/api/user/_id/' + (JSON.parse(user))._id
						};
						var callback = (response) => {
							var user = '';
							response
								.on('data', (chunk) => {
									user += chunk;
								})
								.on('end', () => {
									assert(response.statusCode == resCode['OK']);
									done();
								});
						};
						http.request(options, callback).end();
					});
			};
			http.request(options, callback).end();
		});
	});

	describe.skip('GET /api/user/name/:userName', () => {
		it('should GET User user with user.userName == :userName', (done) => {
			var options = {
				port: config.port,
				path: '/api/user/name/' + mockUsers[testUser].userName
			};
			var resStr = '';
			var callback = function (response) {
				response.on('data', function (chunk) {
					resStr += chunk;
				});
				response.on('end', function () {
					assert(JSON.parse(resStr).userName == mockUsers[testUser].userName);
					done();
				});
			};
			http.request(options, callback).end();
		});
	});

	describe.skip('PUT /api/user/_id/:_id', () => {
		it('should update User user where user._id == :_id', (done) => {
			var newUserName = 'Test';
			var newZip = 00000;
			var options = {
				port: config.port,
				path: '/api/user/name/' + mockUsers[testUser].userName
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
							port: config.port,
							path: '/api/user/_id/' + userJson._id,
							method: 'PUT',
							headers: {
				        'Content-Type': 'application/json',
				        'Content-Length': Buffer.byteLength(JSON.stringify(userJson))
				      }
						};
						var request = http.request(options, (response) => {
							assert(response.statusCode == resCode['OK']);
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

	describe('POST /api/user/_id/:user_id/learning/deck/_id/:deck_id', () => {
		it('should save Deck deck into User user\'s user.decks.learning', () => {
			return new Promise((resolve, reject) => {
				var path = '/api/user/_id/' + mockUsers[testUser]._id + '/learning/deck/_id/' + mockDecks[testDeck]._id;
				var options = {
					port: config.port,
					path: path,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Conteng-Length': Buffer.byteLength(JSON.stringify(mockDecks[testDeck]))
					}
				};
				var req = http.request(options, (res) => {
					try {
						assert.equal(res.statusCode, resCode['OK'], 'badStatusCode: ' + res.statusCode);
					} catch (err) {
						reject(err);
					}
					resolve();
				});
				req.on('error', (err) => reject({ message: 'reqError: ' + err }));
				req.end();
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.port,
						path: '/api/user/_id/' + mockUsers[testUser]._id
					};
					var callback = (res) => {
						var user = '';
						res
							.on('data', (chunk) => user += chunk)
							.on('end', () => resolve(JSON.parse(user)));
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'reqError: ' + err }));
					req.end();
				});
			})
			.then((resolveValue) => {
				assert.equal(resolveValue.decks.learning[0].refDeck, mockDecks[testDeck]._id);
			})
			.then(undefined, (rejectValue) => assert(false, rejectValue.message));
		});
	});

	describe.skip('DELETE /api/user/_id/:_id', () => {
		it('should delete User user with user._id==:_id', (done) => {
			var options = {
				port: config.port,
				path: '/api/user/name/' + mockUsers[testUser].userName
			};
			var callback = (response) => {
				var user = '';
				response
					.on('data', (chunk) => {
						user += chunk;
					})
					.on('end', () => {
						var options = {
							port: config.port,
							path: '/api/user/_id/' + (JSON.parse(user))._id,
							method: 'DELETE'
						};
						var request = http.request(options, (response) => {
							assert(response.statusCode == resCode['OK']);
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