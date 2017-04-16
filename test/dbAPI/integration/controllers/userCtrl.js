const config = require('config').config();
const resCode = require('config').resCode();
const assert = require('chai').assert;
const chai = require('chai');
chai.should();
const expect = require('chai').expect;
const http = require('http');
const mockUsers = require('config').mockUsers();
const mockNewUsers = require('config').mockNewUsers();
const mockDecks = require('config').mockDecks();
const testDeck = require('config').testDeck();
const testUser = require('config').testUser();
const testNewUser = require('config').testNewUser();
const mongoose = require('mongoose');
const dbBootstrap = require('test/dbBootstrap');
const modulesStr = require('appStrings').modules;
const errHeader = require('modules/errorHeader')(__filename);

describe('userCtrl.js', () => {

	before(() => {
		return dbBootstrap.before();
	});

	beforeEach(() => {
		return dbBootstrap.beforeEach();
	});	

	describe('/api/user/find', () => {
		
		describe('GET', () => {

			it('route should exist', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/user/find',
						header: {
							'Content-Type': 'application/json'
						}
					};
					var req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: modulesStr.misc.errMsg.reqFail + err }));
					req.end();
				})
				.then((statusCode) => assert.notEqual(statusCode, resCode['NOTFOUND']))
				.catch((reason) => assert(false, reason.message));
			});

		});

		describe('HEAD', () => {

			it('route should exist', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/user/find',
						method: 'HEAD',
						header: {
							'Content-Type': 'application/json'
						}
					};
					var req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: modulesStr.misc.errMsg.reqFail + err }));
					req.end();
				})
				.then((statusCode) => assert.notEqual(statusCode, resCode['NOTFOUND']))
				.catch((reason) => assert(false, reason.message));
			});

		});
	
	});

	describe('/api/user', () => {
		
		describe('GET', () => {

			it('route should exist', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/user'
					};
					var req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: modulesStr.misc.errMsg.reqFail + err }));
					req.end();
				})
				.then((statusCode) => assert.notEqual(statusCode, resCode['NOTFOUND']))
				.catch((reason) => assert(false, reason.message));
			});
		
			it('should return all Users from db', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/user'
					};
					var callback = (res) => {
						var users = '';
						res
							.on('data', (chunk) => users += chunk)
							.on('end', () => resolve(JSON.parse(users)));
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: modulesStr.misc.errMsg.reqFail + err }));
					req.end();
				})
				.then((users) => {
					assert.lengthOf(users, mockUsers.length);
					for (var i = 0; i < mockUsers.length; i++) {
						expect(mockUsers[i].userName).to.equal(users[i].userName);
					}
				})
				.catch((reason) => assert(false, reason.message));
			});

		});

		describe.skip('POST', () => {

			it('route should exist', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/user',
						method: 'POST'
					};
					var req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: modulesStr.misc.errMsg.reqFail + err }));
					req.end();
				})
				.then((statusCode) => assert.notEqual(statusCode, resCode['NOTFOUND']))
				.catch((reason) => assert(false, reason.message));
			});

			it('should save new User to the db', () => {
				mockNewUser = mockNewUsers[testNewUser];
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/user',
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Content-Length': Buffer.byteLength(JSON.stringify(mockNewUser))
						}
					};
					var req = http.request(options, (res) => {
						debugger;
						resolve();
					})
					req.on('error', (err) => reject({ message: modulesStr.misc.errMsg.reqFail + err }));
					req.end(JSON.stringify(mockNewUser));
				})
				.then(() => {
					return new Promise((resolve, reject) => {
						var options = {
							port: config.app.dbAPI.port,
							path: '/api/user/' + mongoose.Types.ObjectId(mockNewUser._id)
						};
						var req = http.request(options, (res) => {
							var user = '';
							res
								.on('data', (chunk) => user += chunk)
								.on('end', () => resolve(JSON.parse(user)));
						});
						req.on('error', (err) => reject({ message: modulesStr.misc.errMsg.reqFail + err }));
						req.end();
					});
				})
				.then((user) => {
					assert.equal(user._id, mockNewUser._id)
				})
				.catch((reason) => assert(false, reason.message));
			});

		});

	});

	describe.skip('POST /api/user', () => {
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
					port: config.app.dbAPI.port,
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
						port: config.app.dbAPI.port,
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

	describe('GET /api/user/:_id', () => {
		
		describe('GET', () => {

			it('should return user with _id', () => {
				return new Promise((resolve, reject) => {
					const options = {
						port: config.app.dbAPI.port,
						path: '/api/user/' + mockUsers[testUser]._id
					};
					const callback = (response) => {
						var user = '';
						response
							.on('data', (chunk) => user += chunk)
							.on('end', () => resolve(user));
					};
					const request = http.request(options, callback);
					request.end();
				})
				.then((user) => assert.equal(user.name, mockUsers[testUser].name))
				.catch((reason) => assert(false, reason.message));
			});

		});

	});

	describe.skip('GET /api/user/name/:userName', () => {
		it('should GET User user with user.userName == :userName', (done) => {
			var options = {
				port: config.app.dbAPI.port,
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
				port: config.app.dbAPI.port,
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
							port: config.app.dbAPI.port,
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

	describe.skip('POST /api/user/_id/:user_id/learning/deck/_id/:deck_id', () => {
		it('should save Deck deck to User user\'s user.decks.learning', () => {
			return new Promise((resolve, reject) => {
				var path = '/api/user/_id/' + mockUsers[testUser]._id + '/learning/deck/_id/' + mockDecks[testDeck]._id;
				var options = {
					port: config.app.dbAPI.port,
					path: path,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
						// FAILS IF BELOW UN-COMMENTED  ???
						// 'Content-Length': Buffer.byteLength(JSON.stringify(mockDecks[testDeck]))
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
						port: config.app.dbAPI.port,
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

	describe.skip('PUT /api/user/_id/:user_id/learning/deck/_id/:deck_id', () => {
		it('should save updates to Deck deck from User user\'s user.decks.learning where deck._id == :deck_id', () => {
			var mockUser = {};
			return new Promise((resolve, reject) => {
				// get mock user (needs mongo generated IDs)
				var options = {
					port: config.app.dbAPI.port,
					path: '/api/user/_id/' + mockUsers[testUser]._id
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
			})
			.then((user) => {
				mockUser = user;
				return new Promise((resolve, reject) => {
					// make and save edits to user's user.decks.learning
					for (var i = 0; i < mockUser.decks.learning.length; i++) {
						for (var j = 0; j < mockUser.decks.learning[i].flashCards.length; j++) {
							mockUser.decks.learning[i].flashCards[j].gotCorrect = true;
							mockUser.decks.learning[i].flashCards[j].lastSeen = new Date();
							mockUser.decks.learning[i].flashCards[j].lastCorrect = new Date();
							mockUser.decks.learning[i].flashCards[j].correctStreak = 1337;
						}
					}
					// findbyidandupdate edits
					var path = '/api/user/_id/' + mockUsers[testUser]._id + '/learning/deck/_id/' + mockDecks[testDeck]._id;
					var options = {
						port: config.app.dbAPI.port,
						path: path,
						method: 'PUT',
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
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
				// get mock user (needs mongo generated IDs)
				var options = {
					port: config.app.dbAPI.port,
					path: '/api/user/_id/' + mockUsers[testUser]._id
				};
				var req = http.request(options, (res) => {
					var updatedUser = '';
					res
						.on('data', (chunk) => updatedUser += chunk)
						.on('end', () => {
							try {
								assert.equal(res.statusCode, resCode['OK'], 'badStatusCode: ' + res.statusCode);
							} catch (err) {
								reject(err);
							}
							resolve(JSON.parse(updatedUser));
						});
				});
				req.on('error', (err) => reject({ message: 'reqError: ' + err }));
				req.end();
			})
			})
			.then((updatedUser) => {
					// get and verify edits
				assert.equal(updatedUser.decks.learning[0].flashCards[0].correctStreak, 
					mockUser.decks.learning[0].flashCards[0].correctStreak);
			})
			.then(undefined, (reason) => assert(false, reason.message));
		});
	});

	describe.skip('DELETE /api/user/_id/:user_id/learning/deck/_id/:deck_id', () => {
		it('should delete Deck deck from User user\'s user.decks.learning where deck._id == :deck_id', () => {
			return new Promise((resolve, reject) => {
				var path = '/api/user/_id/' + mockUsers[testUser]._id + '/learning/deck/_id/' + mockDecks[testDeck]._id;
				var options = {
					port: config.app.dbAPI.port,
					path: path,
					method: 'DELETE'
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
						port: config.app.dbAPI.port,
						path: '/api/user/_id/' + mockUsers[testUser]._id
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
								user = JSON.parse(user);
								for (var i = 0; i < user.decks.learning.length; i++) {
									if (user.decks.learning[i].refDeck == mockDecks[testDeck]._id)
										reject({ message: 'deleteError: deck was not deleted' })
								};
								resolve();
							});
					});
					req.on('error', (err) => reject({ message: 'reqError: ' + err }));
					req.end();
				});
			})
			.then((user) => assert(true))
			.then(undefined, (reason) => assert(false, reason.message));
		});
	});

	describe.skip('DELETE /api/user/_id/:_id', () => {
		it('should delete User user with user._id==:_id', (done) => {
			var options = {
				port: config.app.dbAPI.port,
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
							port: config.app.dbAPI.port,
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