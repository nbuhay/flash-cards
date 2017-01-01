const config = require('../../../config').config();
const resCode = require('../../../config').resCode();
const assert = require('chai').assert;
const http = require('http');
var mockUsers = require('../../../config').mockUsers();
var mockDecks = require('../../../config').mockDecks();
const testDeck = require('../../../config').testDeck();
const testUser = require('../../../config').testUser();
const mongoose = require('mongoose');

describe('dbAPI/controllers/deckCtrl.js', () => {

	before((done) => {
		console.log('\tBefore Tests');
		// db ceremony...
			var promise = new Promise((resolve, reject) => {
				// cleanse the db
				mongoose.connection.db.dropDatabase(() => {
					console.log('\tmongoose.connection.db.dropDatabase: success');
					resolve();
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// mockUsers[i]._id casted to Mongo ObjectId type
					for (var i = 0; i < mockUsers.length; i++) {
						mockUsers[i]._id = mongoose.Types.ObjectId(mockUsers[i]._id);
					}
					// insert the user collection
					mongoose.connection.collection('users').insert(mockUsers, (err, users) => {
						if (err) reject('mongoose.connection.collection(\'users\').insert: ' + err);
						console.log('\tmongoose.connection.collection(\'users\').insertedCount: %s', users.insertedCount);
						resolve();
				});
			})
			.then(() => {
				// mockDecks[i]._id casted to Mongo ObjectId type
				for (var i = 0; i < mockDecks.length; i++) {
					mockDecks[i]._id = mongoose.Types.ObjectId(mockDecks[i]._id);
				}
				// insert the deck collection
				mongoose.connection.collection('decks').insert(mockDecks, (err, decks) => {
					if (err) reject('mongoose.connection.collection(\'decks\').insert:error: ' + err);
					console.log('\tmongoose.connection.collection(\'decks\').insertedCount: %s', decks.insertedCount);
					done();
				});
			})
			.catch((reason) => console.log('\terror:before.%s', reason));
		});
	});

	beforeEach(() => {
		return new Promise((resolve, reject) => {
			// cleanse the db
			mongoose.connection.db.dropDatabase(() => {
				resolve();
			});
		})
		.then(() => {
			return new Promise((resolve, reject) => {
				// insert the deck collections
				mongoose.connection.collection('decks').insert(mockDecks, (err) => {
					if (err) reject(err);
					resolve();
				});
			})
		})
		.then(() => {
			// insert the user collections
				mongoose.connection.collection('users').insert(mockUsers, (err) => {
					if (err) reject(err);
				});
		})
		.catch((reason) => console.log('error:before.%s', reason));
	});

	describe('GET /api/deck/all', () => {

		it('should exist', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.app.dbAPI.port,
					path: '/api/deck/all'
				};
				var callback = (res) => {
					resolve(res.statusCode);
				};
				var req = http.request(options, callback);
				req.on('error', (err) => reject({ message: 'dbAPIRequest:error: ' + err }));
				req.end();
			})
			.then((statusCode) => {	
				assert.notEqual(statusCode, resCode['NOTFOUND'], 'route not found');
			})
			.catch((reason) => assert(false, reason.message));
		});

		it('should return all Deck documents inserted into the db', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.app.dbAPI.port,
					path: '/api/deck/all'
				};
				var callback = (res) => {
					var decks = '';
					res
						.on('data', (chunk) => decks += chunk)
						.on('end', () => resolve(JSON.parse(decks)));
				};
				var req = http.request(options, callback);
				req.on('error', (err) => reject({ message: 'dbAPIRequest:error: ' + err }));
				req.end();
			})
			.then((decks) => {
				assert.equal(decks.length, mockDecks.length);
				for (var i = 0; i < decks.length; i++) {
					assert.propertyVal(decks[i], '_id', (mockDecks[i]._id).toString());
				}
			})
			.catch((reason) => assert(false, reason.message));
		});

	});

	describe('POST /api/deck', () => {

		it('should exist', () => {
			var mockDeck = {
				_id: mongoose.Types.ObjectId('000000000000000000000003'),
				creator: mockUsers[testUser]._id,
				name: 'TestDeck',
				description: 'POST /api/deck description',
				tags: ['mock', 'test', 'data'],
				cards: [{
				}],
				learning: 0
			};
			return new Promise((resolve, reject) => {
				var options = {
					port: config.app.dbAPI.port,
					path: '/api/deck',
					method: 'POST'
				};
				var callback = (res) => {
					resolve(res.statusCode);
				};
				var req = http.request(options, callback);
				req.on('error', (err) => reject({ message: 'dbAPIRequest:error: ' + err }));
				req.end();
			})
			.then((statusCode) => {	
				assert.notEqual(statusCode, resCode['NOTFOUND'], 'route not found');
			})
			.catch((reason) => assert(false, reason.message));
		});

		it('should create new Deck in the db', () => {
			var mockDeck = {
				_id: mongoose.Types.ObjectId('000000000000000000000003'),
				creator: mockUsers[testUser]._id,
				name: 'TestDeck',
				description: 'POST /api/deck description',
				tags: ['mock', 'test', 'data'],
				cards: [
					mongoose.Types.ObjectId('000000000000000000000000'),
    			mongoose.Types.ObjectId('000000000000000000000001'),
    			mongoose.Types.ObjectId('000000000000000000000002')
				],
				learning: 0
			};
			return new Promise((resolve, reject) => {
				var options = {
					port: config.app.dbAPI.port,
					path: '/api/deck',
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(JSON.stringify(mockDeck))
					}
				};
				// requests only get the response, no .on
				var req = http.request(options, (res) => {
					try {
						assert.equal(res.statusCode, resCode['OK'], 'badStatusCode: ' + res.statusCode);
					} catch (err) {
						reject(err);
					}
					resolve();
				});
				req.on('error', (err) => reject({ message: 'reqError:' + err }));
				req.end(JSON.stringify(mockDeck));
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deck/' + mockDeck._id
					};
					var callback = (res) => {
						var deck = '';
						res
							.on('data', (chunk) => deck += chunk)
							.on('end', () => resolve(JSON.parse(deck)));
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'reqError:' + err }));
					req.end();
				});
			})
			.then((deck) => {
				assert.equal(deck._id, (mockDeck._id).toString());
			})
			.catch((reason) => assert(false, reason.message));
		});
	});

	describe('GET /api/deck/:_id', () => {

		it('should not return a 404', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.app.dbAPI.port,
					path: '/api/deck/' + mockDecks[testDeck]._id
				};
				var callback = (res) => resolve(res.statusCode);
				var req = http.request(options, callback);
				req.on('error', (err) => reject({ message: 'dbAPIRequest:error: ' + err }));
				req.end();
			})
			.then((statusCode) => {	
				assert.notEqual(statusCode, resCode['NOTFOUND'], 'route not found');
			})
			.catch((reason) => assert(false, reason.message));
		});

		describe('should send a 400 when req.params._id is an invalid Mongo ObjectId:', () => {

			it('num chars in req.params._id is < 24', () => {
				return new Promise((resolve, reject) => {
					var invalidId = 'a'.repeat(23);
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deck/' + invalidId
					};
					var callback = (res) => resolve(res.statusCode);
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'dbAPIRequest:error: ' + err }));
					req.end();
				})
				.then((statusCode) => {	
					assert.equal(statusCode, resCode['BADREQ']);
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('num chars in req.params._id is > 24', () => {
				return new Promise((resolve, reject) => {
					var invalidId = 'a'.repeat(25);
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deck/' + invalidId
					};
					var callback = (res) => resolve(res.statusCode);
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'dbAPIRequest:error: ' + err }));
					req.end();
				})
				.then((statusCode) => {	
					assert.equal(statusCode, resCode['BADREQ']);
				})
				.catch((reason) => assert(false, reason.message));
			});

		});

		it('should return Deck deck with deck._id == :_id', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deck/' + mockDecks[testDeck]._id
					};
					var callback = (res) => {
						var deck = '';
						res
							.on('data', (chunk) => deck += chunk)
							.on('end', () => resolve(JSON.parse(deck)));
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'dbAPIRequest:error: ' + err }));
					req.end();
				})
				.then((deck) => {
					assert(deck._id == mockDecks[testDeck]._id);
				})
				.catch((reason) => assert(false, reason.message));
			});

	});

	describe('PUT /api/deck/:_id', () => {
		it('should update Deck deck in the db where deck._id == :_id', () => {
			var mockDeck = {
				creator: mockUsers[testUser]._id,
				name: 'UpdatedDeck',
				description: 'PUT /api/deck:_id',
				tags: ['mock', 'test', 'data'],
				cards: [
					mongoose.Types.ObjectId('000000000000000000000000'),
    			mongoose.Types.ObjectId('000000000000000000000001'),
    			mongoose.Types.ObjectId('000000000000000000000002')
				],
				learning: 0
			};
			mockDeck._id = mockDecks[testDeck]._id;
			return new Promise((resolve, reject) => {
				var options = {
					port: config.app.dbAPI.port,
					path: '/api/deck/' + mockDeck._id,
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(JSON.stringify(mockDeck))
					}
				};
				var req = http.request(options, (res) => {
					if (res.statusCode != resCode['OK']) {
						reject('badStatusCode:' + res.statusCode);
					}
					resolve();
				});
				req.on('error', (err) => reject('reqError:' + err));
				req.end(JSON.stringify(mockDeck));
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deck/' + mockDeck._id
					};
					var callback = (res) => {
						var deck = '';
						res
							.on('data', (chunk) => deck += chunk)
							.on('end', () => {
								resolve(JSON.parse(deck));
							});
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject('reqError:' + err));
					req.end();
				});
			})
			.then((resolveValue) => {
				assert(mockDeck._id == resolveValue._id && mockDeck.name == resolveValue.name);
			})
			.then(undefined, (rejectValue) => {
				console.log('promiseRejected:%s', rejectValue);
				assert(true == false);
			});
		});
	});

	describe('DELETE /api/deck/:_id', () => {
		it('should delete Deck deck from the db where deck._id == :_id', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.app.dbAPI.port,
					path: '/api/deck/000000000000000000000003',
					method: 'DELETE'
				};
				var req = http.request(options, (res) => {
					if (res.statusCode != resCode['OK']) {
						reject('badStatusCode:' + res.statusCode);
					}
					resolve();
				});
				req.on('error', (err) => reject('reqError:' + err));
				req.end();
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deck/000000000000000000000003'
						// path: '/api/' + mockDecks[testDeck]._id
					};
					var callback = (res) => {
						var deck = '';
						res
							.on('data', (chunk) => deck += chunk)
							.on('end', () => resolve(JSON.parse(deck)));
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject('reqError:' + err));
					req.end();
				});
			})
			.then((resolveValue) => {
				// console.log('promiseResolved:expectNullAfterDelete');
				assert(resolveValue == null);
			})
			.then(undefined, (rejectValue) => {
				// console.log('promiseRejected:%s', rejectValue);
				assert(true == false);
			});
		});
	});

});