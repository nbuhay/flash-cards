const str = require('appStrings').dbAPI.controllers.deckCtrl;
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
const validMongoId = require('config').validMongoId();
const jsonRes = require('modules/jsonResponse');
const Deck = require('dbAPI/models/deck');
const Validate = require('dbAPI/modules/validateFactory').Deck;
const deckCtrl = require('dbAPI/controllers/deckCtrl');

var sandbox;
var errorHeader;

beforeEach(() => {
	errorHeader = {
		message: require('modules/errorHeader')(require.resolve('dbAPI/controllers/deckCtrl')) 
	};
	sandbox = sinon.sandbox.create();
});

afterEach(() => sandbox.restore());

describe('deckCtrl.js', () => {

	describe('#findAll', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.findAll);

		it('#findAll should exist', () => assert.isFunction(deckCtrl.findAll));

		it('call Deck.find and pass an empty object', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const conditions = {};
			const execStub = sandbox.stub().rejects();
			const deckStub = sandbox.stub(Deck, 'find').returns({ exec: execStub });

			return deckCtrl.findAll(reqDummy, resDummy)
				.catch(() => expect(deckStub.calledWithExactly(conditions)).to.be.true);
		});

		it('send 500 if Deck.find rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			sandbox.stub(Deck, 'find').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					debugger;
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
				})
		});

		it('send 200 if Deck.find resolves', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const allDeckData = { decks: {} };
			const execStub = sandbox.stub().resolves(allDeckData);
			sandbox.stub(Deck, 'find').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], allDeckData));
				});
		});

	});

	describe('#findById', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.findById);

		it('#findById should exist', () => assert.isFunction(deckCtrl.findById));

		it('call Validate.findById and pass req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findById').rejects();

			return deckCtrl.findById(reqDummy, resDummy)
				.catch(() => validateStub.calledWithExactly(reqDummy).should.be.true);
		});

		it('send 400 if Validate.findById rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			sandbox.stub(Validate, 'findById').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return deckCtrl.findById(reqDummy, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
			});
		});

		it('call Deck.findById and pass req params _id', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findById').resolves();
			const deckStub = sandbox.stub(Deck, 'findById').rejects();

			return deckCtrl.findById(reqStub, resDummy)
				.catch(() => deckStub.calledWithExactly(reqStub.params._id).should.be.true);
		});

		it('send 500 if Deck.findById rejects', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findById').resolves();
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			sandbox.stub(Deck, 'findById').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCtrl.findById(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
				});
		});

		it('send 404 if _id DNE in Deck collection', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findById').resolves();
			const stubCardData = null;
			const execStub = sandbox.stub().resolves(stubCardData);
			sandbox.stub(Deck, 'findById').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return deckCtrl.findById(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader));
				});
		});

		it('send 200 if _id exists in Deck collection', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findById').resolves();
			const deckDataStub = true;
			const execStub = sandbox.stub().resolves(deckDataStub);
			sandbox.stub(Deck, 'findById').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], deckDataStub).should.be.true;
				});
		});

	});

	describe('#create', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.create);

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

		it.skip('should send a 400 when body.creator does not exist in the db', () => {
			const idDoesNotExistInDb = validMongoId;
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

		it.skip('should call /api/deckCard/create for each element in cards array', () => {
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