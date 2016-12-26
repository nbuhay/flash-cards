var CONST = require('../global');
var config = require('../global').config();
const testDeck = require('../global').TEST_DECK();
var assert = require('assert');
var http = require('http');
var mongoose = require('mongoose');
var Deck = require('../dbAPI/models/deck');
var mockDecks = require('../mockData/decks').decks;

describe('Deck Model', () => {

	before((done) => {
		// db ceremony...
		console.log('Bootstrap Unit Tests');
		require('../dbAPI/models/db');
		require('../bin/www');
		// make sure connection is established
		mongoose.connection.once('connected', () => {
			var promise = new Promise((resolve, reject) => {
				// cleanse the dbw
				mongoose.connection.db.dropDatabase(() => {
					console.log('mongoose.connection.db.dropDatabase.success');
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
					console.log('decks.insertedCount=%s', decks.insertedCount);
					done();
				});
			})
			.then(undefined, (rejectValue) => {
				console.log('Something bad happened, should cancel tests...%s', rejectValue);
			});
		});
	});

	// beforeEach(() => {
	// 	// console.log('Before Each Test');
	// });
	// afterEach(() => {
	// 	// console.log('After Each Test');
	// });
	// after(() => {		
	// 	console.log('After Tests');		
	// });

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
				console.log({ msg: rejectValue });
				assert(true == false);
			});
		});
	});

	describe('GET /deck/name/:name', () => {
		it('should return Deck deck with deck.name == :name', (done) => {
			var options = {
				port: config.port,
				path: '/api/deck/name/' + mockDecks[testDeck].name
			};
			var callback = function (response) {
				var deck = '';
				response
					.on('data', (chunk) => {
						deck += chunk;
					})
					.on('end', () => {
						assert(JSON.parse(deck).name == mockDecks[testDeck].name);
						done();
					});
			}
			http.request(options, callback).end();
		});
	});

	describe('GET /api/deck/_id/:_id', () => {
		it('should GET Deck deck with deck._id == :_id', (done) => {
			// need to GET by name first, inserted in test above
			var options = {
				port: config.port,
				path: '/api/deck/_id/' + mockDecks[testDeck]._id
			};
			var callback = function (res) {
				var deck = '';
				res
					.on('data', (chunk) => deck += chunk)
					.on('end', () => {
						assert(JSON.parse(deck)._id == mockDecks[testDeck]._id);
						done();
					});
			};
			http.request(options, callback).end();
		});
	});

	// Does not use done() callback!
	// try to return just the promise
	//   .then and .catch immediately after
	describe('POST /api/deck', () => {
		it('should add a new deck to the db', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.port,
					path: '/api/deck',
					method: 'POST'
				};
				var mockDeck = {
					_id: 4,
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
				// requests only get the response, no .on
				var request = http.request(options, (response) => {
					resolve(response);
				});
				request.on('error', (err) => reject(err));
				request.end(JSON.stringify(mockDeck));
			})
			.then((resolveValue) => {
				assert(resolveValue.statusCode == CONST.RES('OK'));
			})
			.then(undefined, (rejectValue) => {
				console.error({ msg: rejectValue });
				assert(true == false);
			});
		});
	});

	describe('DELETE /api/deck/_id/:_id', () => {
		it('should delete Deck deck where deck._id == :_id', () => {
			// return new Promise((resolve, reject) => {
			// 	var options = {
			// 		port: config.port,
			// 		path: '/api/deck/_id/' + 
			// 	};
			// })
			// .then((resolveValue) => {

			// })
			// .then((undefined, rejectValue) => {

			// });
		});
	});

});