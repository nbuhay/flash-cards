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
		console.log('    Bootstrap Unit Tests');
		require('../bin/www');
		// db ceremony...
		// make sure connection is established
		mongoose.connection.once('connected', () => {
			var promise = new Promise((resolve, reject) => {
				// cleanse the dbw
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
		console.log('    Post-Test Cleanup');
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
				var req = http.request(options, (res) => resolve(res));
				req.on('error', (err) => reject(err));
				req.end(JSON.stringify(mockDeck));
			})
			.then((resolveValue) => {
				if (resolveValue.statusCode != resCode['OK']) reject(resolveValue.statusCode);
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
					req.on('error', (err) => reject(err));
					req.end();
				});
			})
			.then((resolveValue) => {
				assert((JSON.parse(resolveValue))._id == mockDeck._id);
			})
			.then(undefined, (rejectValue) => assert(true == false));
		});
	});

	// describe('DELETE /api/deck/_id/:_id', () => {
	// 	it('should delete Deck deck where deck._id == :_id', () => {
	// 		return new Promise((resolve, reject) => {
	// 			var options = {
	// 				port: config.port,
	// 				path: '/api/deck/_id/' + 
	// 			};
	// 		})
	// 		.then((resolveValue) => {

	// 		})
	// 		.then((undefined, rejectValue) => {

	// 		});
	// 	});
	// });

});