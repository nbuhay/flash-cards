const errMsg = require('appStrings').dbAPI.controllers.deckCardCtrl.errMsg;
const deckCard = require('dbAPI/modules/validate/deckCard');
const vReq = require('dbAPI/modules/validate/req');
const sinon = require('sinon');

var sandbox;

beforeEach(() => sandbox = sinon.sandbox.create());
afterEach(() => sandbox.restore());

describe('deckCard.js', () => {

	describe('#create', () => {

		it.skip('pass the req to be validated');
		
		it('reject if body does\'t have property question', () => {
			const reqStub = { body: {} };
			const resDummy = { res: {} };
			const vReqStub = sandbox.stub(vReq, 'validate').resolves();

			return deckCard.create(reqStub, resDummy).should.be.rejectedWith(errMsg.invalidDeckCard);
		});

		it('reject if body does\'t have property answer', () => {
			const reqStub = { body: { question: {} } };
			const resDummy = { res: {} };
			const vReqStub = sandbox.stub(vReq, 'validate').resolves();

			return deckCard.create(reqStub, resDummy).should.be.rejectedWith(errMsg.invalidDeckCard);
		});

		it.skip('question should be a string array');
		it.skip('answer should be a string array');

	});

});