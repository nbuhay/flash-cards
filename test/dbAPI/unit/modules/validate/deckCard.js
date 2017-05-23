const errMsg = require('appStrings').dbAPI.controllers.deckCardCtrl.errMsg;
const deckCard = require('dbAPI/modules/validate/deckCard');
const vReq = require('dbAPI/modules/validate/req');
const vMongoId = require('dbAPI/modules/validate/mongoId');
const vStringArray = require('dbAPI/modules/validate/stringArray');
const validMongoId = require('config').validMongoId();
const sinon = require('sinon');
const assert = require('chai').assert;
const isEqual = require('lodash').isEqual;

var sandbox;

beforeEach(() => sandbox = sinon.sandbox.create());
afterEach(() => sandbox.restore());

describe('deckCard.js', () => {

	describe('#findById', () => {

		it('pass req params _id to be validated', () => {
			const reqStub = { params: { _id: validMongoId } }; 
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').resolves();
			
			return deckCard.findById(reqStub)
				.then(() => vMongoIdStub.calledWithExactly(validMongoId).should.be.true);
		});

	});

	describe('#create', () => {

		it('call req.validate and pass req', () => {
			const reqDummy = { req: {} };
			const vReqStub = sandbox.stub(vReq, 'validate').rejects();

			return deckCard.create(reqDummy).catch(() => 
				assert(vReqStub.calledWithExactly(reqDummy)));
		});
		
		it('reject if req body key question DNE', () => {
			const reqStub = { body: {} };
			sandbox.stub(vReq, 'validate').resolves();

			return deckCard.create(reqStub).should.be.rejectedWith(errMsg.invalidDeckCard);
		});

		it('reject if body key answer DNE', () => {
			const reqStub = { body: { question: {} } };
			sandbox.stub(vReq, 'validate').resolves();

			return deckCard.create(reqStub).should.be.rejectedWith(errMsg.invalidDeckCard);
		});

		it('call stringArray.validate and pass req body answer', () => {
			const reqStub = { body: { question: [ 'question' ], answer: [ 'answer' ] } };
			sandbox.stub(vReq, 'validate').resolves();
			const vStringArrayStub = sandbox.stub(vStringArray, 'validate').rejects();

			return deckCard.create(reqStub)
				.catch(() => assert(vStringArrayStub.calledWithExactly(reqStub.body.answer)));
		});

		it('call stringArray.validate and pass req body question', () => {
			const reqStub = { body: { question: [ 'question' ], answer: [ 'answer' ] } };
			sandbox.stub(vReq, 'validate').resolves();
			const vStringArrayStub = sandbox.stub(vStringArray, 'validate');
			vStringArrayStub.withArgs(reqStub.body.question).rejects();

			return deckCard.create(reqStub)
				.catch(() => assert(vStringArrayStub.calledWithExactly(reqStub.body.question)));
		});

		it('resolve validated data', () => {
			const reqStub = { body: { question: [ 'question' ], answer: [ 'answer' ] } };
			sandbox.stub(vReq, 'validate').resolves();
			sandbox.stub(vStringArray, 'validate').resolves();

			return deckCard.create(reqStub).then((data) => assert(isEqual(data, reqStub.body)));
		});

	});

	describe('#findByIdAndRemove', () => {

		it('call mongoId.validate and pass req params', () => {
			const reqStub = { params: { _id: validMongoId } }; 
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').resolves();
			
			return deckCard.findByIdAndRemove(reqStub)
				.then(() => assert(vMongoIdStub.calledWithExactly(validMongoId)));
		});

	});

	describe('#findByIdAndUpdate', () => {

		it('call req.validate and pass req', () => {
			const reqDummy = { req: {} };
			const vReqStub = sandbox.stub(vReq, 'validate').rejects();

			return deckCard.findByIdAndUpdate(reqDummy)
				.catch(() => vReqStub.calledWithExactly(reqDummy).should.be.true); 
		});

		it('call mongoId.validate and pass req params _id', () => {
			const vReqStub = sandbox.stub(vReq, 'validate').resolves();
			const reqStub = { params: { _id: validMongoId } }; 
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').rejects();
			
			return deckCard.findByIdAndUpdate(reqStub)
				.catch(() => vMongoIdStub.calledWithExactly(validMongoId).should.be.true);
		});

		it('reject if body keys question or answer DNE', () => {
			const vReqStub = sandbox.stub(vReq, 'validate').resolves();
			const reqStub = { params: { _id: validMongoId }, body: {} };
			sandbox.stub(vMongoId, 'validate').resolves();

			return deckCard.findByIdAndUpdate(reqStub).should.be.rejectedWith(errMsg.invalidUpdate);
		});

		it('cleanse undesired keys from req body', () => {
			const vReqStub = sandbox.stub(vReq, 'validate').resolves();
			const reqStub = { 
				params: { _id: validMongoId }, 
				body: {
					question: [ 'test question' ],
					answer: [ 'test answer' ],
					undesiredKey: 'not in schema'
				}
			};
			sandbox.stub(vMongoId, 'validate').resolves();

			return deckCard.findByIdAndUpdate(reqStub)
				.then(() => (!reqStub.body.hasOwnProperty('undesiredKey')).should.be.true);
		});

		it('call validation on each key', () => {
			const vReqStub = sandbox.stub(vReq, 'validate').resolves();
			const reqStub = { 
				params: { _id: validMongoId }, 
				body: { question: [ 'test question' ], answer: [ 'test answer' ] }
			};
			sandbox.stub(vMongoId, 'validate').resolves();
			const vStringArrayStub = sandbox.stub(vStringArray, 'validate').resolves();

			return deckCard.findByIdAndUpdate(reqStub)
				.then(() => {
					vStringArrayStub.calledWithExactly(reqStub.body.question).should.be.true;
					vStringArrayStub.calledWithExactly(reqStub.body.answer).should.be.true;
				});
		});

		it('resolve validated data', () => {
			const vReqStub = sandbox.stub(vReq, 'validate').resolves();
			const reqStub = { 
				params: { _id: validMongoId }, 
				body: { question: [ 'test question' ], answer: [ 'test answer' ] }
			};
			sandbox.stub(vMongoId, 'validate').resolves();
			const vStringArrayStub = sandbox.stub(vStringArray, 'validate').resolves();

			return deckCard.findByIdAndUpdate(reqStub)
				.then((data) => assert(isEqual(data, reqStub.body)));
		});

	});

});