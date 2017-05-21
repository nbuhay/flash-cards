const errMsg = require('appStrings').dbAPI.controllers.deckCardCtrl.errMsg;
const deckCard = require('dbAPI/modules/validate/deckCard');
const vReq = require('dbAPI/modules/validate/req');
const vMongoId = require('dbAPI/modules/validate/mongoId');
const vStringArray = require('dbAPI/modules/validate/stringArray');
const validMongoId = require('config').validMongoId();
const sinon = require('sinon');

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

	describe('#findByIdAndRemove', () => {

		it('pass req params _id to be validated', () => {
			const reqStub = { params: { _id: validMongoId } }; 
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').resolves();
			
			return deckCard.findByIdAndRemove(reqStub)
				.then(() => vMongoIdStub.calledWithExactly(validMongoId).should.be.true);
		});

	});

	describe('#findByIdAndUpdate', () => {

		it('call mongoId.validate and pass req params _id', () => {
			const reqStub = { params: { _id: validMongoId } }; 
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').rejects();
			
			return deckCard.findByIdAndUpdate(reqStub)
				.catch(() => vMongoIdStub.calledWithExactly(validMongoId).should.be.true);
		});

		it('reject if body does\'t have property question or answer', () => {
			const reqStub = { params: { _id: validMongoId }, body: {} };
			sandbox.stub(vMongoId, 'validate').resolves();

			return deckCard.findByIdAndUpdate(reqStub).should.be.rejectedWith(errMsg.invalidUpdate);
		});

		it('cleanse undesired keys from req body', () => {
			const reqStub = { 
				params: { _id: validMongoId }, 
				body: {
					question: 'test question',
					answer: 'test answer',
					undesiredKey: 'not in schema'
				}
			};
			sandbox.stub(vMongoId, 'validate').resolves();

			return deckCard.findByIdAndUpdate(reqStub)
				.then(() => (!reqStub.body.hasOwnProperty('undesiredKey')).should.be.true);
		});

		it('call validation on each key', () => {
			const reqStub = { 
				params: { _id: validMongoId }, 
				body: {
					question: 'test question',
					answer: 'test answer',
				}
			};
			sandbox.stub(vMongoId, 'validate').resolves();
			const vStringArrayStub = sandbox.stub(vStringArray, 'validate').resolves();

			return deckCard.findByIdAndUpdate(reqStub)
				.then(() => {
					vStringArrayStub.calledWithExactly(reqStub.body.question).should.be.true;
					vStringArrayStub.calledWithExactly(reqStub.body.answer).should.be.true;
				});
		});


		// check has either question or answer
		//   nothing to update otherwise
		// object that just captures possible values to update
		//   extra values are dropped
		//   handle undefined
	})

});