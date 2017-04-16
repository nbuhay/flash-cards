const str = require('appStrings').dbAPI.controllers.deckCardCtrl;
const modulesStr = require('appStrings').modules;
const mongoose = require('mongoose');
const assert = require('chai').assert;
const sinon = require('sinon');
require('sinon-as-promised');
const resCode = require('config').resCode();
const invalidMongoId = require('config').invalidMongoId();
const validMongoId = require('config').validMongoId();
const jsonReq = require('modules/jsonRequest');
const jsonRes = require('modules/jsonResponse');
const DeckCard = require('dbAPI/models/deckCard');
const deckCardCtrl = require('dbAPI/controllers/deckCardCtrl');

var sandbox;
var errorHeader;

beforeEach(function() {
	errorHeader = { 
		message: require('modules/errorHeader')(require.resolve('dbAPI/controllers/deckCardCtrl')) 
	};
	sandbox = sinon.sandbox.create();
});

afterEach(function() {
	sandbox.restore();
});

describe('deckCardCtrl.js', () => {

	describe('#findAll', () => {

		beforeEach(function() {
			errorHeader.message += 'findAll: ';
		});

		it('function named findAll should exist', () => {
			assert.isFunction(deckCardCtrl.findAll);
		});

		it('should call Deck.find with the empty list as the only arg', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const conditions = {};
			const jsonResStub = sandbox.stub(jsonRes);
			const execStub = sandbox.stub().resolves();
			const deckCardStub = sandbox.stub(DeckCard, 'find').returns({ exec: execStub });

			return deckCardCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					assert.equal(deckCardStub.callCount, 1, 'should be called once');
					assert(deckCardStub.calledWithExactly(conditions), 'passed args not expected');
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 200 when DeckCard.find resolves', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const allDeckCardData = { deckCards: {} };
			const execStub = sandbox.stub().resolves(allDeckCardData);
			
			sandbox.stub(DeckCard, 'find').returns({ exec: execStub });

			return deckCardCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					assert.equal(jsonResStub.callCount, 1, 'should be called once');
					assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], allDeckCardData),
						'passed args not expected');
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 500 when DeckCard.find rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			
			errorHeader.message += str.errMsg.checkQuery;
			sandbox.stub(DeckCard, 'find').returns({ exec: execStub });

			return deckCardCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					assert.equal(jsonResStub.callCount, 1, 'should be called once');
					assert(jsonResStub.calledWith(resDummy, resCode['SERVFAIL'], errorHeader), 
						'passed args not expected');
					assert.equal(jsonResStub.firstCall.args[2].message, errorHeader.message, 'errorHeader');
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#findById', () => {

		beforeEach(function() {
			errorHeader.message += 'findById: ';
		});

		it('function named findById should exist', () => {
			assert.isFunction(deckCardCtrl.findAll);
		});

		it('should send 400 if _id is not a valid Mongo ObjectID', () => {
			const reqStub = { 
				params: {
					_id: invalidMongoId
				} 
			};
			const resDummy = { res: {} };
			const jsonReqSpy = sandbox.spy(jsonReq, 'validateMongoId');
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidMongoId;

			return deckCardCtrl.findById(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonReqSpy.callCount, 1, 'should be called once');
						assert(jsonReqSpy.calledWithExactly(invalidMongoId), 'req spy passed args not expected');
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], 
							errorHeader), 'res stub passed args not expected');			
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 404 if _id does\'t exist in DeckCard collection', () => {
			const idNotInCollection = validMongoId;
			const reqStub = { 
				params: {
					_id: idNotInCollection
				} 
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const stubCardData = null;
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const mockExec = sandbox.stub().resolves(stubCardData);
			const deckCardStub = sandbox.stub(DeckCard, 'findById').returns({ exec: mockExec });
			errorHeader.message += str.errMsg.doesNotExist;

			return deckCardCtrl.findById(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader),
							'passed args not expected');			
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 500 if DeckCard.findById rejects', () => {
			const idInCollection = validMongoId;
			const reqStub = { 
				params: {
					_id: idInCollection
				} 
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const mockExec = sandbox.stub().rejects();
			const deckCardStub = sandbox.stub(DeckCard, 'findById').returns({ exec: mockExec });
			errorHeader.message += str.errMsg.checkQuery;

			return deckCardCtrl.findById(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader), 
							'passed args not expected');			
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 200 if _id exists in DeckCard collection', () => {
			const idInCollection = validMongoId;
			const reqStub = { 
				params: {
					_id: idInCollection
				} 
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const stubCardData = true;
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const mockExec = sandbox.stub().resolves(stubCardData);
			const deckCardStub = sandbox.stub(DeckCard, 'findById').returns({ exec: mockExec });

			return deckCardCtrl.findById(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], stubCardData), 
							'passed args not expected');			
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#create', () => {

		beforeEach(function() {
			errorHeader.message += 'create: ';
		});

		it('function named create should exist', () => {
			assert.isFunction(deckCardCtrl.create);
		});

		it('should call jsonReq.validateBody once and pass the req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.create(reqDummy, resDummy)
				.then(() => {
						assert.equal(jsonReqStub.callCount, 1, 'should be called once');
						assert(jsonReqStub.calledWithExactly(reqDummy), 'passed args not expected'); 
				});
		});

		it('should send 400 if header content-type is undefined', () => {
			const reqStub = { headers: {} };
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.noContentType;

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						debugger;
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');			
				});
		});

		it('should send 400 if header content-type is not application/json', () => {
			const reqStub = { 
				headers: {
					'content-type': 'text'
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 
				(modulesStr.jsonRequest.errMsg.invalidContentType + reqStub.headers['content-type']);

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');			
				});
		});

		it('should send 400 if req body is undefined', () => {
			const reqStub = { 
				headers: {
					'content-type': 'application/json'
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidReqBody;

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');			
				});
		});

		it('should send 400 if req body is null', () => {
			const reqStub = { 
				headers: {
					'content-type': 'application/json'
				},
				body: null
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidReqBody;

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');
				});
		});

		it('should send 400 if req body is not valid JSON', () => {
			const invalidJson = 'notJsonFormat';
			const reqStub = {
				body: invalidJson
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			errorHeader.message += str.errMsg.invalidDeckCard;

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');			
				});
		});

		it('should send 400 if req body does\'t have the property question', () => {
			const invalidDeckCard = {};
			const reqStub = {
				body: invalidDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidDeckCard;

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');			
				});
		});

		it('should send 400 if req body doesn\'t have property answer', () => {
			const invalidDeckCard = { 
				question: true
			};
			const reqStub = {
				body: invalidDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidDeckCard;

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');				
				});
		});

		it('should send 400 if question is not an array', () => {
			const invalidDeckCard = { 
				question: true, 
				answer: true 
			};
			const reqStub = {
				body: invalidDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 
				(str.errMsg.invalidArrayField + typeof reqStub.body.question);

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');				
				});
		});

		it('should send 400 if answer is not an array', () => {
			const invalidDeckCard = { 
				question: [], 
				answer: true 
			};
			const reqStub = {
				body: invalidDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 
				(str.errMsg.invalidArrayField + typeof reqStub.body.answer);

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');		
				});
		});

		it('should send 400 if question is not an array of only strings', () => {
			const invalidDeckCard = { 
				question: [true],
				answer: []
			};
			const reqStub = {
				body: invalidDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidStringArray;

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');		
				});
		});

		it('should send 400 if answer is not an array of only strings', () => {
			const invalidDeckCard = { 
				question: ['true'], 
				answer: [true]
			};
			const reqStub = {
				body: invalidDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidStringArray;

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader), 
							'passed args not expected');		
				});
		});

		it('should send 500 if DeckCard.create throws an exception', () => {
			const validDeckCard = { 
				question: ['true'], 
				answer: ['true']
			};
			const reqStub = {
				body: validDeckCard
			};
			const resStub = { res: {} };
			sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const deckCardStub = sandbox.stub(DeckCard, 'create').rejects();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return deckCardCtrl.create(reqStub, resStub)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resStub, resCode['SERVFAIL'], errorHeader), 
							'passed args not expected');			
				});
		});

		it('should send 200 when DeckCard.create resolves', () => {
			const validDeckCard = { 
				question: ['true'], 
				answer: ['true'] 
			};
			const reqStub = {
				body: validDeckCard
			};
			const resDummy = { res: {} };
			sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const deckCardStub = sandbox.stub(DeckCard, 'create').resolves(reqStub.body);
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.create(reqStub, resDummy)
				.then(() => {
						assert.equal(jsonResStub.callCount, 1, 'should be called once');
						assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], reqStub.body), 
							'passed args not expected');				
				});
		});

	});

	describe('#findByIdAndRemove', () => {

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

	describe('#findByIdAndUpdate', () => {

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
