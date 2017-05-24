const mongoose = require('mongoose');
const assert = require('chai').assert;
const http = require('http');
const resCode = require('config').resCode();
const config = require('config').config();
const DeckCard = require('dbAPI/models/deckCard');
const deckCardCtrl = require('dbAPI/controllers/deckCardCtrl');
const mockDeckCards = require('config').mockDeckCards();
const mockDecks = require('config').mockDecks();
const mockUsers = require('config').mockUsers();
const testDeckCard = require('config').testDeckCard();
const testDeck = require('config').testDeck();
const testUser = require('config').testUser();
const validMongoId = require('config').validMongoId();
const dbBootstrap = require('test/dbBootstrap');
const errHeader = require('modules/errorHeader')(__filename);

describe.skip('deckCardCtrl.js', () => {

	before(() => {
		return dbBootstrap.before();
	});

	beforeEach(() => {
		return dbBootstrap.beforeEach();
	});	

	describe('/api/deckCard', () => {
		
		describe('POST', () => {

			it('route should exist', () => {
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
				.then((statusCode) => assert.notEqual(statusCode, resCode['NOTFOUND']))
				.catch((reason) => assert(false, reason.message));
			});
			
			it.skip('should send the new deckCard when its saved to the db', () => {
				const mockDeckCard = mockDeckCards[testDeckCard];
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

	describe('/api/deckCard/all', () => {

		describe('GET', () => {
			
			it('should not return a 404 when calling this GET route', () => {
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
					req.on('error', (err) => reject({ message: errHeader + 'reqError: ' + err }));
					req.end();
				})
				.then((deckCard) => {
					assert.propertyVal(deckCard, '_id', mockDeckCards[testDeckCard]._id.toString());
				})
				.catch((reason) => assert(false, reason.message));
			});

		});

		describe('DELETE', () => {

			it('should not return a 404 when calling this DELETE route', () => {
				return new Promise((resolve, reject) => {
					const options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/:_id',
						method: 'DELETE'
					};
					const req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: errHeader + 'reqError: ' + err }));
					req.end();
				})
				.then((statusCode) => {
					assert.notEqual(statusCode, resCode['NOTFOUND'], 'route does not exist');
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('should send a 404 when no document with _id is found', () => {
					return new Promise((resolve, reject) => {
						const options = {
							port: config.app.dbAPI.port,
							path: '/api/deckCard/' + validMongoId,
							method: 'DELETE'
						};
						const req = http.request(options, (res) => resolve(res.statusCode));
						req.on('error', (err) => reject({ message: errHeader + 'reqError: ' + err }));
						req.end();
					})
					.then((statusCode) => {
						assert.equal(statusCode, resCode['NOTFOUND']);
					})
					.catch((reason) => assert(false, reason.message));
				});

			it('should send a 200 when an existing DeckCard is deleted from the db', () => {
				return new Promise((resolve, reject) => {
					const options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/' + mockDeckCards[testDeckCard]._id.toString(),
						method: 'DELETE'
					};
					const req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: errHeader + 'reqError: ' + err }));
					req.end();
				})
				.then((statusCode) => {
					assert.equal(statusCode, resCode['OK']);
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('should return the deleted DeckCard when it is deleted from the db', () => {
				const validMongoId = mockDeckCards[testDeckCard]._id.toString();
				return new Promise((resolve, reject) => {
					const options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/' + validMongoId,
						method: 'DELETE'
					};
					const req = http.request(options, (res) => {
						var deckCard = '';
						res
							.on('data', (chunk) => deckCard += chunk)
							.on('end', () => {
								resolve(JSON.parse(deckCard));
							});
					});
					req.on('error', (err) => reject({ message: errHeader + 'reqError: ' + err }));
					req.end();
				})
				.then((deletedDeckCard) => {
					assert.equal(deletedDeckCard._id, validMongoId);
				})
				.catch((reason) => assert(false, reason.message));
			});

		});

		describe('PUT', () => {

			it('should not return a 404 when calling this PUT route', () => {
				return new Promise((resolve, reject) => {
					const options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/:_id',
						method: 'PUT'
					};
					const req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: errHeader + 'reqError: ' + err }));
					req.end();
				})
				.then((statusCode) => {
					assert.notEqual(statusCode, resCode['NOTFOUND'], 'route does not exist');
				})
				.catch((reason) => assert(false, reason.message));
			});

			it('should send a 404 when no document with :_id is found in the db', () => {
				return new Promise((resolve, reject) => {
					const mockDeckCard = {
						_id: 'a'.repeat(24),
						question: ['Valid question'],
						answer:	['Valid answer']
					};
					const options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/' + mockDeckCard._id,
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'Content-Length': Buffer.byteLength(JSON.stringify(mockDeckCard))
						}
					};
					const req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: errHeader + 'reqError: ' + err }));
					req.end(JSON.stringify(mockDeckCard));
				})
				.then((statusCode) => {
					assert.equal(statusCode, resCode['NOTFOUND'], 'should not be found in db');
				})
				.catch((reason) => assert(false, reason.message));
			});

			it.skip('should send a 200 when document with :_id is found and updated', () => {
				const mockDeckCard = {
					_id: mockDeckCards[testDeckCard]._id.toString(),
					question: ['Valid question'],
					answer:	['Valid answer']
				};
				return new Promise((resolve, reject) => {
					const options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/' + mockDeckCard._id,
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'Content-Length': Buffer.byteLength(JSON.stringify(mockDeckCard))
						}
					};
					const req = http.request(options, (res) => resolve(res.statusCode));
					req.on('error', (err) => reject({ message: errHeader + 'reqError: ' + err }));
					req.end(JSON.stringify(mockDeckCard));
				})
				.then((statusCode) => {
					assert.equal(statusCode, resCode['OK'], 'should be found in the db');
				})
				.catch((reason) => assert(false, reason.message));
			});

			it.skip('should return the updated document when :_id is found and updated', () => {
				const mockDeckCard = {
					_id: mockDeckCards[testDeckCard]._id.toString(),
					question: ['Valid question'],
					answer:	['Valid answer']
				};
				return new Promise((resolve, reject) => {
					const options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/' + mockDeckCard._id,
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'Content-Length': Buffer.byteLength(JSON.stringify(mockDeckCard))
						}
					};
					const req = http.request(options, (res) =>{
					 var updatedDeckCard = '';
					 res
					 	.on('data', (chunk) => updatedDeckCard += chunk)
					 	.on('end', () => resolve(JSON.parse(updatedDeckCard)));
					 });
					req.on('error', (err) => reject({ message: errHeader + 'reqError: ' + err }));
					req.end(JSON.stringify(mockDeckCard));
				})
				.then((updatedDeckCard) => {
					assert.equal(updatedDeckCard._id, mockDeckCard._id, 'should be found in the db');
					assert.equal(updatedDeckCard.question.length, mockDeckCard.question.length);
					for (var i = 0; i < updatedDeckCard.question.length; i++) {
						assert.equal(updatedDeckCard.question[i], mockDeckCard.question[i], 'question should match');
					}
					assert.equal(updatedDeckCard.answer.length, mockDeckCard.answer.length);
					for (var i = 0; i < updatedDeckCard.answer.length; i++) {
						assert.equal(updatedDeckCard.answer[i], mockDeckCard.answer[i], 'answer should match');
					}
				})
				.catch((reason) => assert(false, reason.message));
			});

			it.skip('should only update question when question is the only provided field', () => {
				const mockDeckCard = {
					_id: mockDeckCards[testDeckCard]._id.toString(),
					question: ['Valid question']
				};
				return new Promise((resolve, reject) => {
					const options = {
						port: config.app.dbAPI.port,
						path: '/api/deckCard/' + mockDeckCard._id,
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'Content-Length': Buffer.byteLength(JSON.stringify(mockDeckCard))
						}
					};
					const req = http.request(options, (res) =>{
					 var updatedDeckCard = '';
					 res
					 	.on('data', (chunk) => updatedDeckCard += chunk)
					 	.on('end', () => resolve(JSON.parse(updatedDeckCard)));
					 });
					req.on('error', (err) => reject({ message: errHeader + 'reqError: ' + err }));
					req.end(JSON.stringify(mockDeckCard));
				})
				.then((updatedDeckCard) => {
					assert.equal(updatedDeckCard._id, mockDeckCard._id, 'should be found in the db');
					assert.equal(updatedDeckCard.question.length, mockDeckCard.question.length);
					for (var i = 0; i < updatedDeckCard.question.length; i++) {
						assert.equal(updatedDeckCard.question[i], mockDeckCard.question[i], 'question should match');
					}
					assert.equal(updatedDeckCard.answer.length, mockDeckCards[testDeckCard].answer.length);
					for (var i = 0; i < updatedDeckCard.answer.length; i++) {
						assert.equal(updatedDeckCard.answer[i], mockDeckCards[testDeckCard].answer[i], 'answer should match');
					}
				})
				.catch((reason) => assert(false, reason.message));
			});

		});
	
	});

});