const config = require('../global').config();
const resCode = require('../global').resCode();
const testDeck = require('../global').testDeck();
const server = require('../bin/www').server();
var assert = require('assert');
var http = require('http');
var mongoose = require('mongoose');
var Deck = require('../dbAPI/models/deck');
var mockDecks = require('../mockData/decks').decks;

describe('Deck Model', () => {

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
			.then((resolveValue) => {
				// mockDecks[i]._id casted to Mongo ObjectId type
				for (var i = 0; i < mockDecks.length; i++) {
					mockDecks[i]._id = mongoose.Types.ObjectId(mockDecks[i]._id);
				}
				// drop the collections
				mongoose.connection.collection('decks').insert(mockDecks, (err, decks) => {
					if (err) reject(err);
					console.log('\tMongoose.connection.collection(\'decks\').insertedCount:%s', decks.insertedCount);
					done();
				});
			})
			.then(undefined, (rejectValue) => {
				console.log('\tSomething bad happened, should cancel tests...%s', rejectValue);
			});
		});
	});

	after(() => {		
		console.log('   After Tests');
		console.log('\tClosing server...');
		server.close((err, data) => (err) ? console.log('Error:' + err) : console.log('\tServer Closed'));		
	});

	// promise implementation
	describe('GET /api/decks', () => {
		it('should return all Deck docs', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.port,
					path: '/api/decks'
				};
				var callback = (res) => {
					var decks = '';
					res
						.on('data', (chunk) => decks += chunk)
						.on('end', () => resolve(JSON.parse(decks)));
				};
				var req = http.request(options, callback);
				req.on('error', (err) => reject(err));
				req.end();
			})
			.then((resolveValue) => {
				assert(resolveValue.length == mockDecks.length);
			})
			// will catch node.js runtime errors
			//   possibly can catch resolve() error in the assert because:
			//     assert is a node library
			//		 failure counts as a node.js runtime error
			.then(undefined, (rejectValue) => {
				assert(true == false);
			});
		});
	});

	describe('GET /deck/name/:name', () => {
		it('should return Deck deck with deck.name == :name', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.port,
					path: '/api/deck/name/' + mockDecks[testDeck].name
				};
				var callback = (res) => {
					var deck = '';
					res
						.on('data', (chunk) => deck += chunk)
						.on('end', () => resolve(deck));
				};
				var req = http.request(options, callback);
				req.on('error', (err) => reject(err));
				req.end();
			})
			.then((resolveValue) => {
				assert(JSON.parse(resolveValue).name == mockDecks[testDeck].name);
			})
			.then(undefined, (rejectValue) => assert(true == false));
		});
	});

	describe('GET /api/deck/_id/:_id', () => {
		it('should return Deck deck with deck._id == :_id', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.port,
					path: '/api/deck/_id/' + mockDecks[testDeck]._id
				};
				var callback = function (res) {
					var deck = '';
					res
						.on('data', (chunk) => deck += chunk)
						.on('end', () => resolve(deck));
				};
				var req = http.request(options, callback);
				req.on('error', (err) => reject(err));
				req.end();
			})
			.then((resolveValue) => {
				assert(JSON.parse(resolveValue)._id == mockDecks[testDeck]._id);
			})
			.then(undefined, (rejectValue) => assert(true == false));
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