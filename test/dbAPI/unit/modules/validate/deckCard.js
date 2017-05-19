const errMsg = require('appStrings').dbAPI.controllers.deckCardCtrl.errMsg;
const deckCard = require('dbAPI/modules/validate/deckCard');
const vReq = require('dbAPI/modules/validate/req');
const vMongoId = require('dbAPI/modules/validate/mongoId');
const validMongoId = require('config').validMongoId();
const sinon = require('sinon');

var sandbox;

beforeEach(() => sandbox = sinon.sandbox.create());
afterEach(() => sandbox.restore());

describe('deckCard.js', () => {

	describe('#findById', () => {

		it('pass mongoId param to be validated', () => {
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').resolves();
			
			return deckCard.findById(validMongoId)
				.then(() => vMongoIdStub.calledWithExactly(validMongoId).should.be.true);
		});

	});

	describe('#create', () => {

		it.skip('pass req to be validated');
		
		it('reject if body does\'t have property question', () => {
			const reqStub = { body: {} };
			const vReqStub = sandbox.stub(vReq, 'validate').resolves();

			return deckCard.create(reqStub).should.be.rejectedWith(errMsg.invalidDeckCard);
		});

		it('reject if body does\'t have property answer', () => {
			const reqStub = { body: { question: {} } };
			const vReqStub = sandbox.stub(vReq, 'validate').resolves();

			return deckCard.create(reqStub).should.be.rejectedWith(errMsg.invalidDeckCard);
		});

		it.skip('question should be a string array');
		it.skip('answer should be a string array');

	});

});