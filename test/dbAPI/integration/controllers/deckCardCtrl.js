const mongoose = require('mongoose');
const assert = require('chai').assert;
const sinon = require('sinon');
const http = require('http');
const resCode = require('config').resCode();
const config = require('config').config();
const jsonRes = require('dbAPI/modules/jsonResponse');
const DeckCard = require('dbAPI/models/deckCard');
const deckCardCtrl = require('dbAPI/controllers/deckCardCtrl');
const mockDeckCards = require('config').mockDeckCards();
const mockDecks = require('config').mockDecks();
const mockUsers = require('config').mockUsers();
const testDeckCard = require('config').testDeckCard();
const testDeck = require('config').testDeck();
const testUser = require('config').testUser();
const errHeader = require('modules/errorHeader')(__filename);

describe('deckCtrl.js', () => {

	before(() => {
		console.log('\tBefore Tests');
		// db ceremony...
			return new Promise((resolve, reject) => {
				// cleanse the db
				mongoose.connection.db.dropDatabase(() => {
					console.log('\tmongoose.connection.db.dropDatabase: success');
					resolve();
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// mockDeckCards[i]._id casted to Mongo ObjectId type
					for (var i = 0; i < mockDeckCards.length; i++) {
						mockDeckCards[i]._id = mongoose.Types.ObjectId(mockDeckCards[i]._id);
					}
					// insert the deckCard collection
					mongoose.connection.collection('deckcards').insert(mockDeckCards, (err, users) => {
						if (err) reject('mongoose.connection.collection(\'deckcards\').insert: ' + err);
						console.log('\tmongoose.connection.collection(\'deckcards\').insertedCount: %s', users.insertedCount);
						resolve();
					});
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
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// mockDecks[i]._id casted to Mongo ObjectId type
					for (var i = 0; i < mockDecks.length; i++) {
						mockDecks[i]._id = mongoose.Types.ObjectId(mockDecks[i]._id);
					}
					// insert the deck collection
					mongoose.connection.collection('decks').insert(mockDecks, (err, decks) => {
						if (err) reject('mongoose.connection.collection(\'decks\').insert:error: ' + err);
						console.log('\tmongoose.connection.collection(\'decks\').insertedCount: %s', decks.insertedCount);
						resolve();
					});
				});
			})
			.catch((reason) => console.log('\t%sbefore.%s', errorHeader, reason));
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
				// insert the deckCard collection
				mongoose.connection.collection('deckcards').insert(mockDeckCards, (err) => {
					if (err) reject(err);
					resolve();
				});
			})
		})
		.then(() => {
			return new Promise((resolve, reject) => {
				// insert the deck collection
				mongoose.connection.collection('decks').insert(mockDecks, (err) => {
					if (err) reject(err);
					resolve();
				});
			})
		})
		.then(() => {
			// insert the user collection
				mongoose.connection.collection('users').insert(mockUsers, (err) => {
					if (err) reject(err);
				});
		})
		.catch((reason) => console.log('error:before.%s', reason));
	});

	describe('/api/deckCard/all', () => {

		describe('GET', () => {
			it('should not return a 404', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/all'
					};
					var req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((statusCode) => {
					assert.notEqual(statusCode, resCode['NOTFOUND'], 'route does not exist')
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('should have a res content-type header of application/json', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/all'
					};
					var callback = (res) => {
						resolve(res.headers['content-type']);
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((contentType) => {
					assert.match(contentType, /^application\/json.*$/, 'content-type was ' + contentType);
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('should return an array of JSON objects', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/all'
					};
					var callback = (res) => {
						deckCards = '';
						res
							.on('data', (chunk) => deckCards += chunk)
							.on('end', () => resolve(JSON.parse(deckCards)));
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((parsedDeckCards) => {
					assert.isArray(parsedDeckCards);
					parsedDeckCards.forEach((deckCard) => assert.isObject(deckCard));
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('should return the same number of DeckCards inserted into the db', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/all'
					};
					var callback = (res) => {
						var deckCards = '';
						res
							.on('data', (chunk) => deckCards += chunk)
							.on('end', () => {
								resolve(JSON.parse(deckCards));
							});
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((deckCards) => assert.lengthOf(deckCards, mockDeckCards.length))
				.catch((reason) => assert(false, reason.message));
			});

			it('should return the DeckCards inserted into the db, based on _id', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/all'
					};
					var callback = (res) => {
						var deckCards = '';
						res
							.on('data', (chunk) => deckCards += chunk)
							.on('end', () => {
								resolve(JSON.parse(deckCards));
							});
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((deckCards) => {
					for (var i = 0; i < deckCards.length; i++) {
						assert.propertyVal(deckCards[i], '_id', mockDeckCards[i]._id.toString());
					}
				})
				.catch((reason) => assert(false, reason.message));
			});

		});

	});

	describe('/api/deckCard/:_id', () => {

		describe('GET', () => { 

			it('should not return a 404', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/:_id'
					};
					var req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((statusCode) => {
					assert.notEqual(statusCode, resCode['NOTFOUND'], 'route does not exist');
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('should send a 404 when req is missing :_id', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/'
					};
					var req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((statusCode) => {
					assert.equal(statusCode, resCode['NOTFOUND'], 'req missing param _id');
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('should send a 400 when :_id is an invalid Mongo ObjectId', () => {
				return new Promise((resolve, reject) => {
					var options = {
							port: config.app.dbAPI.port,
							path: '/api/deckCard/' + 'a'.repeat(23)
					};
					var req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((statusCode) => {
					assert.equal(statusCode, resCode['BADREQ']);
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('should have a res content-type header of application/json', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/:_id'
					};
					var callback = (res) => {
						resolve(res.headers['content-type']);
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((contentType) => {
					assert.match(contentType, /^application\/json.*$/, 'content-type was ' + contentType);
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('should return a 404 if the deckCard is null', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/' + 'a'.repeat(24)
					};
					var req = http.request(options, (res) => resolve(res.statusCode));	
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((statusCode) => {
					assert.equal(statusCode, resCode['NOTFOUND']);
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('should return a single JSON object', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/' + mockDeckCards[testDeckCard]._id
					};
					var callback = (res) => {
						var deckCard = '';
						res
							.on('data', (chunk) => deckCard += chunk)
							.on('end', () => resolve(JSON.parse(deckCard)));
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((deckCard) => assert.isObject(deckCard))
				.catch((reason) => assert(false, reason.message));
			});
			
			it('should return the same DeckCard inserted into the db, based on _id', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/' + mockDeckCards[testDeckCard]._id
					};
					var callback = (res) => {
						var deckCard = '';
						res
							.on('data', (chunk) => deckCard += chunk)
							.on('end', () => resolve(JSON.parse(deckCard)));
					};
					var req = http.request(options, callback);
					req.on('error', (err) => reject({ message: 'dbAPIReq:error: ' + err }));
					req.end();
				})
				.then((deckCard) => {
					assert.propertyVal(deckCard, '_id', mockDeckCards[testDeckCard]._id.toString());
				})
				.catch((reason) => assert(false, reason.message));
			});

		});
	
		describe('POST', () => {

			it('should not return a 404', () => {
				return new Promise((resolve, reject) => {
					var options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/',
						method: 'POST'
					};
					var req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: errHeader + 'create: ' + err }));
					req.end();
				})
				.then((statusCode) => {
					assert.notEqual(statusCode, resCode['NOTFOUND'], 'route does not exist');
				})
				.catch((reason) => assert(false, reason.message));
			});
			
			it('should send the new deckCard when its saved to the db', () => {
				const mockDeckCard = {
					_id: 'a'.repeat(24),
					question: ['Valid question'],
					answer:	['Valid answer']
				};
				return new Promise((resolve, reject) => {
					const options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/',
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Content-Length': Buffer.byteLength(JSON.stringify(mockDeckCard))
						}
					};
					const req = http.request(options, (res) => {
						var deckCard = '';
						res
							.on('data', (chunk) => deckCard += chunk)
							.on('end', () => {
								resolve(JSON.parse(deckCard));
							})
					});
					req.on('error', (err) => reject({ message: errHeader + 'create.reqError: ' + err }));
					req.end(JSON.stringify(mockDeckCard));
				})
				.then((createdDeckCard) => {
					assert.equal(createdDeckCard._id, mockDeckCard._id);
				})
				.catch((reason) => assert(false, reason.message));
			});

		});

	});

});