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

		it('#create exists', () => assert.isFunction(deckCtrl.create));

		it('call Validate.create and pass the req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'create').rejects();

			return deckCtrl.create(reqDummy, resDummy)
				.catch(() => expect(validateStub.calledWithExactly(reqDummy)).to.be.true);
		});

		it('send 400 if Validate.create rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			sandbox.stub(Validate, 'create').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return deckCtrl.create(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));
				});
		});
		
		it('send 500 if Validate.create rejects with apiServfail', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: str.errMsg.apiServfail };
			sandbox.stub(Validate, 'create').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return deckCtrl.create(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
				});
		});

		it('call Deck.create and pass returned data from Validate.create', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validatedData = { validatedData: {} };
			sandbox.stub(Validate, 'create').resolves(validatedData);
			const deckStub = sandbox.stub(Deck, 'create').rejects();

			return deckCtrl.create(reqDummy, resDummy)
				.catch(() => assert(deckStub.calledWithExactly(validatedData)));
		});

		it('send 500 if Deck.create rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validatedData = { validatedData: {} };
			sandbox.stub(Validate, 'create').resolves(validatedData);
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			sandbox.stub(Deck, 'create').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCtrl.create(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
			});
		});

		it('send 200 and new Deck if Deck.create resolves', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validatedData = { validatedData: {} };
			sandbox.stub(Validate, 'create').resolves(validatedData);
			const deckStub = { deck: {} };
			const execStub = sandbox.stub().resolves(deckStub);
			sandbox.stub(Deck, 'create').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.create(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], deckStub));
			});
		});

	});


	describe('#findByIdAndRemove', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.findByIdAndRemove);

		it('#findByIdAndRemove exists', () => assert.isFunction(deckCtrl.findByIdAndRemove));

		it('call Validate.findByIdAndRemove and pass req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findByIdAndRemove').rejects();

			return deckCtrl.findByIdAndRemove(reqDummy, resDummy)
				.catch(() => assert(validateStub.calledWithExactly(reqDummy)));
		});

		it('send 400 if Validate.findByIdAndRemove rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			sandbox.stub(Validate, 'findByIdAndRemove').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return deckCtrl.findByIdAndRemove(reqDummy, resDummy)
				.then(() => assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader)));
		});

		it('call Deck.findByIdAndRemove and pass req params _id', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndRemove').resolves();
			const deckStub = sandbox.stub(Deck, 'findByIdAndRemove').rejects();

			return deckCtrl.findByIdAndRemove(reqStub, resDummy)
				.catch(() => assert(deckStub.calledWithExactly(reqStub.params._id)));
		});

		it('send 500 if Deck.findByIdAndRemove rejects', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndRemove').resolves();
			const execStub = sandbox.stub().rejects(undefined);
			const deckStub = sandbox.stub(Deck, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCtrl.findByIdAndRemove(reqStub, resDummy).then(() => 
				assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader)));		
		});

		it('send 404 if _id DNE in Deck collection', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndRemove').resolves();
			const returnedDeckStub = null;
			const execStub = sandbox.stub().resolves(returnedDeckStub);
			sandbox.stub(Deck, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return deckCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader));
				});
		});

		it('send 200 and removed Deck if _id is removed from the collection', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndRemove').resolves();
			const removedDeckStub = { deck: {} };
			const execStub = sandbox.stub().resolves(removedDeckStub);
			sandbox.stub(Deck, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
						assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], removedDeckStub));
				});
		});

	});

});