const str = require('appStrings').dbAPI.controllers.deckCardCtrl;
const modulesStr = require('appStrings').modules;
const assert = require('chai').assert;
const sinon = require('sinon');
require('sinon-as-promised');
const resCode = require('config').resCode();
const invalidMongoId = require('config').invalidMongoId();
const validMongoId = require('config').validMongoId();
const jsonReq = require('modules/jsonRequest');
const jsonRes = require('modules/jsonResponse');
const DeckCard = require('dbAPI/models/deckCard');
const Validate = require('dbAPI/modules/validateFactory').DeckCard;
const deckCardCtrl = require('dbAPI/controllers/deckCardCtrl');
const expect = require('chai').expect;

var sandbox;
var errorHeader;

beforeEach(() => {
	errorHeader = {
		message: require('modules/errorHeader')(require.resolve('dbAPI/controllers/deckCardCtrl')) 
	};
	sandbox = sinon.sandbox.create();
});

afterEach(() => sandbox.restore());

describe('deckCardCtrl.js', () => {

	describe('#findAll', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.findAll);

		it('#findAll should exist', () => assert.isFunction(deckCardCtrl.findAll));

		it('call DeckCard.find and pass an empty object', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const conditions = {};
			const execStub = sandbox.stub().rejects();
			const deckCardStub = sandbox.stub(DeckCard, 'find').returns({ exec: execStub });

			return deckCardCtrl.findAll(reqDummy, resDummy)
				.catch(() => expect(deckCardStub.calledWithExactly(conditions)).to.be.true);
		});

		it('send 500 if DeckCard.find rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			sandbox.stub(DeckCard, 'find').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCardCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
				})
		});

		it('send 200 if DeckCard.find resolves', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const allDeckCardData = { deckCards: {} };
			const execStub = sandbox.stub().resolves(allDeckCardData);
			sandbox.stub(DeckCard, 'find').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], allDeckCardData));
				});
		});

	});

	describe('#findById', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.findById);

		it('#findById should exist', () => assert.isFunction(deckCardCtrl.findAll));

		it('call Validate.findById and pass req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findById').rejects();

			return deckCardCtrl.findById(reqDummy, resDummy)
				.catch(() => validateStub.calledWithExactly(reqDummy).should.be.true);
		});

		it('send 400 if Validate.findById rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			const validateStub = sandbox.stub(Validate, 'findById').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return deckCardCtrl.findById(reqDummy, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
			});
		});
		
		it('call DeckCard.findById and pass req params _id', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findById').resolves();
			const deckCardStub = sandbox.stub(DeckCard, 'findById').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.findById(reqStub, resDummy)
				.then(() => deckCardStub.calledWithExactly(reqStub.params._id).should.be.true);
		});

		it('send 500 if DeckCard.findById rejects', () => {
			const idInCollection = validMongoId;
			const reqStub = { params: { _id: idInCollection } };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findById').resolves();
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			const deckCardStub = sandbox.stub(DeckCard, 'findById').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader).should.be.true;
				});
		});

		it('send 404 if _id does\'t exist in DeckCard collection', () => {
			const idNotInCollection = validMongoId;
			const reqStub = { params: { _id: idNotInCollection } };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findById').resolves();
			const stubCardData = null;
			const execStub = sandbox.stub().resolves(stubCardData);
			const deckCardStub = sandbox.stub(DeckCard, 'findById').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return deckCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader).should.be.true;
				});
		});

		it('send 200 if _id exists in DeckCard collection', () => {
			const idInCollection = validMongoId;
			const reqStub = { params: { _id: idInCollection } };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findById').resolves();
			const stubCardData = true;
			const execStub = sandbox.stub().resolves(stubCardData);
			const deckCardStub = sandbox.stub(DeckCard, 'findById').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], stubCardData).should.be.true;
				});
		});

	});

	describe('#create', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.create);

		it('#create exists', () => assert.isFunction(deckCardCtrl.create));

		it('call Validate.create and pass the req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'create').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.create(reqDummy, resDummy)
				.then(() => expect(validateStub.calledWithExactly(reqDummy)).to.be.true);
		});

		it('send 400 if Validate.create rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			const validateStub = sandbox.stub(Validate, 'create').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return deckCardCtrl.create(reqDummy, resDummy)
				.then(() => {
					expect(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader)).to.be.true;
				});
		});

		it('call DeckCard.create and pass validated req data', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validatedData = { validatedData: {} };
			sandbox.stub(Validate, 'create').resolves(validatedData);
			const deckCardStub = sandbox.stub(DeckCard, 'create').rejects();

			return deckCardCtrl.create(reqDummy, resDummy)
				.catch(() => assert(deckCardStub.calledWithExactly(validatedData)));
		});

		it('send 500 if DeckCard.create rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validatedData = { validatedData: {} };
			sandbox.stub(Validate, 'create').resolves(validatedData);
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			sandbox.stub(DeckCard, 'create').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCardCtrl.create(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
				});
		});

		it('send 200 and the new DeckCard when DeckCard.create resolves', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validatedData = { validatedData: {} };
			sandbox.stub(Validate, 'create').resolves(validatedData);
			const deckCard = { deckCard: {} };
			const execStub = sandbox.stub().resolves(deckCard);
			sandbox.stub(DeckCard, 'create').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.create(reqDummy, resDummy)
				.then(() => {
					expect(jsonResStub.calledWithExactly(resDummy, resCode['OK'], deckCard)).to.be.true;
				});
		});

	});

	describe('#findByIdAndRemove', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.findByIdAndRemove);

		it('#findByIdAndRemove should exist', () => assert.isFunction(deckCardCtrl.findByIdAndRemove));

		it('call Validate.findById and pass req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findByIdAndRemove').rejects();

			return deckCardCtrl.findByIdAndRemove(reqDummy, resDummy)
				.catch(() => validateStub.calledWithExactly(reqDummy).should.be.true);
		});

		it('send 400 if Validate.findByIdAndRemove rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			const validateStub = sandbox.stub(Validate, 'findByIdAndRemove').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return deckCardCtrl.findByIdAndRemove(reqDummy, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
			});
		});

		it('call DeckCard.findByIdAndRemove and pass req params _id', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findByIdAndRemove').resolves();
			const deckCardStub = sandbox.stub(DeckCard, 'findByIdAndRemove').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => deckCardStub.calledWithExactly(reqStub.params._id).should.be.true);
		});

		it('send 500 if DeckCard.findByIdAndRemove rejects', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findByIdAndRemove').resolves();
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			const deckCardStub = sandbox.stub(DeckCard, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader).should.be.true;
				});
		});

		it('send 404 if _id does\'t exist in DeckCard collection', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findByIdAndRemove').resolves();
			const stubCardData = null;
			const execStub = sandbox.stub().resolves(stubCardData);
			const deckCardStub = sandbox.stub(DeckCard, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return deckCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader).should.be.true;
				});
		});
	
		it('send 200 and removed card data if _id is deleted from the collection', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findByIdAndRemove').resolves();
			const stubCardData = true;
			const execStub = sandbox.stub().resolves(stubCardData);
			const deckCardStub = sandbox.stub(DeckCard, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], stubCardData).should.be.true;
				});
		});

	});

	describe('#findByIdAndUpdate', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.findByIdAndUpdate);

		it('#findByIdAndUpdate should exist', () => {
			assert.isFunction(deckCardCtrl.findByIdAndUpdate);
		});
		
		it('call Validate.findByIdAndUpdate and pass req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findByIdAndUpdate').rejects();

			return deckCardCtrl.findByIdAndUpdate(reqDummy, resDummy)
				.catch(() => validateStub.calledWithExactly(reqDummy).should.be.true);
		});

		it('send 400 if Validate.findByIdAndUpdate rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			const validateStub = sandbox.stub(Validate, 'findByIdAndUpdate').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return deckCardCtrl.findByIdAndUpdate(reqDummy, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				});
		});

		it('call DeckCard.findByIdAndUpdate and pass req params _id, validated req data,' + 
			'and options to return the updated object', () => {
			const reqStub = { params: { _id: validMongoId }, body: { question: 'test question' } };
			const resDummy = { res: {} };
			const options = { new: true };
			sandbox.stub(Validate, 'findByIdAndUpdate').resolves(reqStub.body);
			const deckCardStub = sandbox.stub(DeckCard, 'findByIdAndUpdate').rejects();

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.catch(() => {
					deckCardStub.calledWithExactly(reqStub.params._id, reqStub.body, options)
						.should.be.true;
			});
		});

		it('send 500 if DeckCard.findByIdAndUpdate rejects', () => {
			const reqStub = { params: { _id: validMongoId }, body: { question: 'test question' } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndUpdate').resolves(reqStub.body);
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			sandbox.stub(DeckCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
				});
		});

		it('send 404 if req params _id DNE exist in the db', () => {
			const reqStub = { params: { _id: validMongoId }, body: { question: 'test question' } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndUpdate').resolves(reqStub.body);
			const returnedDeckCardStub = null;
			const execStub = sandbox.stub().resolves(returnedDeckCardStub);
			sandbox.stub(DeckCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader));
				});
		});

		it('send 200 and the updated DeckCard if DeckCard.findByIdAndUpdate resolves', () => {
			const reqStub = { params: { _id: validMongoId }, body: { question: 'test question' } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndUpdate').resolves(reqStub.body);
			const returnedDeckCardStub = { deckCard: {} };
			const execStub = sandbox.stub().resolves(returnedDeckCardStub);
			sandbox.stub(DeckCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
						assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], returnedDeckCardStub));
				});
		});

	});

});