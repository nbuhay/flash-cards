const config = require('../../../config').config();
const resCode = require('../../../config').resCode();
const assert = require('chai').assert;
const http = require('http');
const mockUsers = require('../../../config').mockUsers();
const mockDecks = require('../../../config').mockDecks();
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
			// mockDecks[i]._id casted to Mongo ObjectId type
			for (var i = 0; i < mockDecks.length; i++) {
				mockDecks[i]._id = mongoose.Types.ObjectId(mockDecks[i]._id);
			}
			// drop the collections
			mongoose.connection.collection('decks').insert(mockDecks, (err, decks) => {
				if (err) reject(err);
				console.log('\tmongoose.connection.collection(\'decks\').insertedCount: %s', decks.insertedCount);
				done();
			});
		})
		.catch((reason) => console.log('error:before.%s', reason));
	});

	describe('GET /api/decks', () => {

		it('should not return a 404', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.dbPort,
					path: '/api/decks/'
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
					port: config.dbPort,
					path: '/api/decks'
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
			.then((decks) => assert(decks.length == mockDecks.length))
			.catch((reason) => assert(false, reason.message));
		});

	});

	describe('GET /api/deck/_id/:_id', () => {

		it('should not return a 404', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.dbPort,
					path: '/api/deck/_id/' + mockDecks[testDeck]._id
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

		it('should return Deck deck with deck._id == :_id', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.port,
					path: '/api/deck/_id/' + mockDecks[testDeck]._id
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

	// Does not use done() callback!
	// try to return just the promise
	//   .then and .catch immediately after
	describe('POST /api/deck', () => {
		it('should save new Deck to the db', () => {
			var mockDeck = {
				_id: mongoose.Types.ObjectId('000000000000000000000003'),
				name: 'TestDeck',
				description: 'POST /api/deck description',
				tags: ['mock', 'test', 'data'],
				cards: [
					{
						question: ['Is this a test'],
						answer: ['Yes']
					},
					{
						question: ['R U Sure'],
						answer: ['Ys']
					}
				],
				learning: 10
			};
			return new Promise((resolve, reject) => {
				var options = {
					port: config.port,
					path: '/api/deck',
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Conteng-Length': Buffer.byteLength(JSON.stringify(mockDeck))
					}
				};
				// requests only get the response, no .on
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
						port: config.port,
						path: '/api/deck/_id/' + mockDeck._id
					};
					var callback = (res) => {
						var deck = '';
						res
							.on('data', (chunk) => deck += chunk)
							.on('end', () => resolve(deck));
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject('reqError:' + err));
					req.end();
				});
			})
			.then((resolveValue) => {
				assert((JSON.parse(resolveValue))._id == mockDeck._id);
			})
			.then(undefined, (rejectValue) => {
				// console.log('promiseRejected:%s', rejectValue);
				assert(true == false);
			});
		});
	});

	describe('PUT /api/deck/_id/:_id', () => {
		it('should update Deck deck in the db where deck._id == :_id', () => {
			var mockDeck = {
				name: 'UpdatedDeck',
				description: 'PUT /api/deck/_id/:_id',
				tags: ['mock', 'test', 'data'],
				cards: [
					{
						question: ['PUT test'],
						answer: ['Ys']
					},
					{
						question: ['GET test'],
						answer: ['No']
					}
				],
				learning: 0
			};
			mockDeck._id = mockDecks[testDeck]._id;
			return new Promise((resolve, reject) => {
				var options = {
					port: config.port,
					path: '/api/deck/_id/' + mockDeck._id,
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
						port: config.port,
						path: '/api/deck/_id/' + mockDeck._id
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

	describe('DELETE /api/deck/_id/:_id', () => {
		it('should delete Deck deck from the db where deck._id == :_id', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.port,
					path: '/api/deck/_id/' + mockDecks[testDeck]._id,
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
						port: config.port,
						path: '/api/deck/_id/' + mockDecks[testDeck]._id
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