const mongoose = require('mongoose');
const assert = require('chai').assert;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.should();
const expect = require('chai').expect;
const sinon = require('sinon');
require('sinon-as-promised');
const nock = require('nock');
const resCode = require('config').resCode();
const config = require('config').config();
const jsonRes = require('modules/jsonResponse');
const Deck = require('dbAPI/models/deck');
const deckCtrl = require('dbAPI/controllers/deckCtrl');
const dbBootstrap = require('test/dbBootstrap');

var sandbox;

describe('deckCtrl.js', () => {

	before(() => {
		errorHeader = { message: 'error:dbAPI.deckCtrl.' };
		return dbBootstrap.before();
	});

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		return dbBootstrap.beforeEach();
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('#findAll', () => {

		it('function named findAll should exist', () => {
			expect(deckCtrl.findAll).to.exist;
		});

		it('should call Deck.find with conditions equal to a empty object', () => {
			const conditions = {};
			const resDummy = { res: {} };
			const reqDummy = { req: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().resolves();
			const deckStub = sandbox.stub(Deck, 'find', () => { return { exec: execStub } });

			return deckCtrl.findAll(resDummy, reqDummy)
				.then(() => {
					expect(deckStub.calledOnce, 'calledOnce').to.be.true;
					expect(deckStub.calledWithExactly(conditions), 'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 when Deck.find rejects', () => {
			const conditions = {};
			const resDummy = { res: {} };
			const reqDummy = { req: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().rejects();
			const deckStub = sandbox.stub(Deck, 'find', () => { return { exec: execStub } });

			return deckCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					expect(deckStub.calledOnce, 'deck calledOnce').to.be.true;
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.
						calledWithMatch(resDummy, resCode['SERVFAIL']),'calledWithMatch').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 when Deck.find resolves', () => {
			const conditions = {};
			const resDummy = { res: {} };
			const reqDummy = { req: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().resolves();
			const deckStub = sandbox.stub(Deck, 'find', () => { return { exec: execStub } });

			return deckCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					expect(deckStub.calledOnce, 'deck calledOnce').to.be.true;
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.
						calledWithMatch(resDummy, resCode['OK']),'calledWithMatch').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#create', () => {

		beforeEach(() => {
			errorHeader.message += 'create: ';
		});

		it('should send a 400 when header content-type is undefined', () => {
			const reqStub = {
				headers: {}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']), 'calledWithMatch')
						.to.be.true;
				});
		});

		it('should send a 400 when header content-type is undefined', () => {
			const reqStub = {
				headers: {}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']), 'calledWithMatch')
						.to.be.true;
				});
		});

		it('should send a 400 when header content-type is not application/json', () => {
			const reqStub = {
				headers: {
					'content-type': 'text'
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']), 'calledWithMatch')
						.to.be.true;
				});
		});

		it('should send a 400 when no creator included in body', () => {
			const invalidBody = {};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']),
						'calledWithMatch').to.be.true;
				});
		});

		it('should send a 400 when the given creator is not a valid MongoId', () => {
			const invalidMongoId = 'a'.repeat(23);
			const invalidBody = {
				creator: invalidMongoId,
				name: '',
				description: ''
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']),
						'calledWithMatch').to.be.true;
				});
		});
	
		it('should send a 400 when no name included in body', () => {
			const validMongoId = 'a'.repeat(24);
			const invalidBody = {
				creator: validMongoId
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']),
						'calledWithMatch').to.be.true;
				});
		});

		it('should send a 400 when body.name is not a string', () => {
			const validMongoId = 'a'.repeat(24);
			const invalidName = 4;
			const invalidBody = {
				creator: validMongoId,
				name: invalidName
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']),
						'calledWithMatch').to.be.true;
				});
		});

		it('should send a 400 when body.name is an empty string', () => {
			const validMongoId = 'a'.repeat(24);
			const invalidName = '';
			const invalidBody = {
				creator: validMongoId,
				name: invalidName
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']),
						'calledWithMatch').to.be.true;
				});
		});

		it('should send a 400 when no description included in body', () => {
			const validMongoId = 'a'.repeat(24);
			const validName = 'Test';
			const invalidBody = {
				creator: validMongoId,
				name: validName
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']),
						'calledWithMatch').to.be.true;
				});
		});

		it('should send a 400 when body.description is not a string', () => {
			const validMongoId = 'a'.repeat(24);
			const validName = 'Test';
			const invalidDescription = 4;
			const invalidBody = {
				creator: validMongoId,
				name: validName,
				description: invalidDescription
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']),
						'calledWithMatch').to.be.true;
				});
		});

		it('should send a 400 when body.description is the empty string', () => {
			const validMongoId = 'a'.repeat(24);
			const validName = 'Test';
			const invalidDescription = '';
			const invalidBody = {
				creator: validMongoId,
				name: validName,
				description: invalidDescription
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']),
						'calledWithMatch').to.be.true;
				});
		});

		it('should send a 400 when no cards included in body', () => {
			const validMongoId = 'a'.repeat(24);
			const validName = 'Test';
			const validDescription = 'Description';
			const invalidBody = {
				creator: validMongoId,
				name: validName,
				description: validDescription
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']),
						'calledWithMatch').to.be.true;
				});
		});

		it('should send a 400 when body.cards is not an array', () => {
			const validMongoId = 'a'.repeat(24);
			const validName = 'Test';
			const validDescription = 'Description';
			const invalidCards = 5;
			const invalidBody = {
				creator: validMongoId,
				name: validName,
				description: validDescription,
				cards: invalidCards
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']),
						'calledWithMatch').to.be.true;
				});
		});

		it('should send a 400 when body.creator does not exist in the db', () => {
			const idDoesNotExistInDb = 'a'.repeat(24);
			const validName = 'Test';
			const validDescription = 'Description';
			const validCards = [];
			const invalidBody = {
				creator: idDoesNotExistInDb,
				name: validName,
				description: validDescription,
				cards: validCards
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const userDoesNotExistInDb = null;
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'creator does not exist in db';
			nock('http://localhost:' + config.app.dbAPI.port)
				.get('/api/user/_id/' + idDoesNotExistInDb)
				.reply(resCode['NOTFOUND'], userDoesNotExistInDb);

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ'], errorHeader	),
						'calledWithMatch').to.be.true;
				});
		});

		it('should call /api/deckCard/create for each element in cards array', () => {
			const idDoesNotExistInDb = 'a'.repeat(24);
			const validName = 'Test';
			const validDescription = 'Description';
			const validCards = [];
			const invalidBody = {
				creator: idDoesNotExistInDb,
				name: validName,
				description: validDescription,
				cards: validCards
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: invalidBody
			};
			const resDummy = { res: {} };
			const userDoesNotExistInDb = null;
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'creator does not exist in db';
			nock('http://localhost:' + config.app.dbAPI.port)
				.get('/api/user/_id/' + idDoesNotExistInDb)
				.reply(resCode['NOTFOUND'], userDoesNotExistInDb);

			return deckCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.calledWithMatch(resDummy, resCode['BADREQ'], errorHeader	),
						'calledWithMatch').to.be.true;
				});
		});

		//   NEED http.request options to include hostname
		//     Default has been going to localhost
		// for all elements in the card array, call deckCardCreate
		//   check every element in deck.cards array is a deckCard (question and answer)
		//   if reject, fail

		// need unit tests for validate functions first
			// cards
			// description
			// creator
			// name
		// then write these unit tests to ensure it calls the validate functions

	});
	// describe('#create');
	// describe('#findById');
	// describe('#findByIdAndUpdate');
	// describe('#findByIdAndRemove');

});