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

beforeEach(function() {
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

		it('call Deck.find and pass an empty object', () => {
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
				})
		});

	});

	describe('#findById', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.findById);

		it('#findById should exist', () => assert.isFunction(deckCardCtrl.findAll));

		it('call Validate.findById and pass req params _id', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findById').rejects();

			return deckCardCtrl.findById(reqStub, resDummy)
				.catch(() => validateStub.calledWithExactly(reqStub.params._id).should.be.true);
		});

		it('send 400 if Validate.findById rejects', () => {
			const reqStub = { params: { _id: invalidMongoId } };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			const validateStub = sandbox.stub(Validate, 'findById').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return deckCardCtrl.findById(reqStub, resDummy)
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
				.then(() => expect(validateStub.calledWithExactly(reqDummy)).to.be.true)
				.catch((reason) => assert(false, reason.message));
		});

		it('send 400 if Validate.create rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			const validateStub = sandbox.stub(Validate, 'create').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return deckCardCtrl.create(reqDummy, resDummy)
				.then(() => expect(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader))
					.to.be.true)
				.catch((reason) => assert(false, reason.message));
		});

		it.skip('create a DeckCard');

		it('send 500 if Query rejects', () => {
			const reqStub = { body: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'create').resolves();
			const content = undefined;
			const execStub = sandbox.stub().rejects(content);
			const deckCardStub = sandbox.stub(DeckCard, 'create').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader)).to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('send 200 and the new DeckCard when Query resolves', () => {
			const reqStub = { body: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'create').resolves();
			const deckCard = { deckCard: {} };
			const execStub = sandbox.stub().resolves(deckCard);
			const deckCardStub = sandbox.stub(DeckCard, 'create').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledWithExactly(resDummy, resCode['OK'], deckCard)).to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe.skip('#findByIdAndRemove', () => {

		beforeEach(function() {
			errorHeader.message += 'findByIdAndRemove: ';
		});

		it('function named findByIdAndRemove should exist', () => {
			assert.isFunction(deckCardCtrl.findByIdAndRemove);
		});

		it('should call jsonReq.validateMongoId and pass _id', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqSpy = sandbox.spy(jsonReq, 'validateMongoId');
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
					assert.equal(jsonReqSpy.callCount, 1, 'should be called once');
					assert(jsonReqSpy.calledWithExactly(reqStub.params._id),
					 'passed args not expected');
				});
		});

		it('should send 400 if _id is not a valid Mongo ObjectID', () => {
			const reqStub = {
				params: {
					_id: invalidMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidMongoId;

			return deckCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');			
				});
		});

		it('should send 500 if DeckCard.findByIdAndRemove rejects', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves(reqStub.params._id);
			const execStub = sandbox.stub().rejects();
			const deckCardStub = 
				sandbox.stub(DeckCard, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
					assert.equal(jsonResStub.callCount, 1, 'should be called once');
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader),
					 'passed args not expected');	
				});
		});

		it('should send 404 if _id is not found in the DeckCard collection', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves(reqStub.params._id);
			const execStub = sandbox.stub().resolves(null);
			const deckCardStub = 
				sandbox.stub(DeckCard, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return deckCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
					assert.equal(jsonResStub.callCount, 1, 'should be called once');
					assert(jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader),
					 'passed args not expected');
				});
		});
	
		it('should send 200 and the deleted card if _id is deleted from the collection', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves(reqStub.params._id);
			const returnedDeckCardStub = { question: ['true'], answer: ['true'] };
			const execStub = sandbox.stub().resolves(returnedDeckCardStub);
			const deckCardStub = 
				sandbox.stub(DeckCard, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
					assert.equal(jsonResStub.callCount, 1, 'should be called once');
					assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], returnedDeckCardStub),
					 'passed args not expected');	
				});
		});

	});

	describe.skip('#findByIdAndUpdate', () => {

		beforeEach(function() {
			errorHeader.message += str.funcHeader.findByIdAndUpdate;
		});

		it('function named findByIdAndUpdate should exist', () => {
			assert.isFunction(deckCardCtrl.findByIdAndUpdate);
		});

		it('should call jsonReq.validateMongoId and pass _id', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqSpy = sandbox.spy(jsonReq, 'validateMongoId');
			sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonReqSpy.calledWithExactly(reqStub.params._id));
				});
		});

		it('should send 400 if _id is not a valid Mongo ObjectID', () => {
			const reqStub = {
				params: {
					_id: invalidMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidMongoId;

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));		
				});
		});

		it('should send 400 if header content-type is undefined', () => {
			const reqStub = { 
				headers: {},
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.noContentType;

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));
				});
		});

		it('should send 400 if header content-type is not application/json', () => {
			const reqStub = { 
				headers: {
					'content-type': 'text'
				},
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 
				(modulesStr.jsonRequest.errMsg.invalidContentType + reqStub.headers['content-type']);

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));
				});
		});

		it('should send 400 when req body is undefined', () => {
			const reqStub = { 
				headers: {
					'content-type': 'application/json'
				},
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidReqBody;

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));
				});
		});

		it('should send 400 when req body is null', () => {
			const reqStub = { 
				headers: {
					'content-type': 'application/json'
				},
				params: {
					_id: validMongoId
				},
				body: null
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidReqBody;

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));
				});
		});

		it('should send 400 when req body doesn\'t have either a question or answer field', () => {
			const invalidDeckCard = {};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				params: {
					_id: validMongoId
				},
				body: invalidDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidDeckCard;

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));
				});
		});

		it('should send 400 if question is not an array', () => {
			const invalidDeckCard = { question: true };
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				params: {
					_id: validMongoId
				},
				body: invalidDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 
				(str.errMsg.invalidArrayField + typeof reqStub.body.question);

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));
				});
		});

		it('should send 400 if answer is not an array', () => {
			const invalidDeckCard = { answer: true };
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				params: {
					_id: validMongoId
				},
				body: invalidDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 
				(str.errMsg.invalidArrayField + typeof reqStub.body.answer);

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));
				});
		});

		it('should send 400 if question is not an array of only strings', () => {
			const invalidDeckCard = { question: [true] };
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				params: {
					_id: validMongoId
				},
				body: invalidDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidStringArray;

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));
				});
		});

		it('should send 400 if answer is not an array of only strings', () => {
			const invalidDeckCard = { answer: [true] };
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				params: {
					_id: validMongoId
				},
				body: invalidDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidStringArray;

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));				
				});
		});

		it('should send 500 if DeckCard.findByIdAndUpdate rejects', () => {
			const validDeckCard = { 
				answer: ['true'], 
				question: ['string'] 
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				params: {
					_id: validMongoId
				},
				body: validDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const execStub = sandbox.stub().rejects();
			const deckCardStub = sandbox.stub(DeckCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
				});
		});

		it('should send 404 if_id does not exist in the db', () => {
			const validDeckCard = {
				answer: ['true'],
				question: ['string']
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				params: {
					_id: validMongoId
				},
				body: validDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const returnedDeckCardStub = null;
			const execStub = sandbox.stub().resolves(returnedDeckCardStub);
			const deckCardStub = sandbox.stub(DeckCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader));
				});
		});

		it('should send 200 if DeckCard.findByIdAndUpdate resolves', () =>{
			const validDeckCard = {
				answer: ['true'],
				question: ['string']
			};
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				params: {
					_id: validMongoId
				},
				body: validDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const returnedDeckCardStub = {};
			const execStub = sandbox.stub().resolves(returnedDeckCardStub);
			const deckCardStub = sandbox.stub(DeckCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
						assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], returnedDeckCardStub));
				});
		});

	});

});
