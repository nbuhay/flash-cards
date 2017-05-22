const errMsg = require('appStrings').dbAPI.controllers.deckCardCtrl.errMsg;
const userCard = require('dbAPI/modules/validate/userCard');
const vReq = require('dbAPI/modules/validate/req');
const http = require('http');
const config = require('config').config();
const vMongoId = require('dbAPI/modules/validate/mongoId');
const validMongoId = require('config').validMongoId();
const sinon = require('sinon');
const resCode = require('config').resCode();

var sandbox;

beforeEach(() => sandbox = sinon.sandbox.create());
afterEach(() => sandbox.restore());

describe('userCard.js', () => {

	describe('#findById', () => {

		it('pass req params _id to be validated', () => {
			const reqStub = { params: { _id: validMongoId } }; 
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').resolves();
			
			return userCard.findById(reqStub)
				.then(() => vMongoIdStub.calledWithExactly(validMongoId).should.be.true);
		});

	});

	describe('#create', () => {
		
		it('call req.validate and pass req', () => {
			const reqDummy = { req: {} };
			const vReqStub = sandbox.stub(vReq, 'validate').rejects();
			
			return userCard.create(reqDummy)
				.catch(() => vReqStub.calledWithExactly(reqDummy).should.be.true);
		});

		it.skip('throw error if req.validate rejects');

		it('reject if req body key deckCard DNE', () => {
			const reqStub = { body: {} };
			sandbox.stub(vReq, 'validate').resolves();

			return userCard.create(reqStub).should.be.rejectedWith(errMsg.undefinedDeckCard);
		});

		it('call mongoId.validate and pass req body deckCard', () => {
			const reqStub = { body: { deckCard: validMongoId } };
			sandbox.stub(vReq, 'validate').resolves();
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').rejects();
			
			return userCard.create(reqStub)
				.catch(() => vMongoIdStub.calledWithExactly(reqStub.body.deckCard).should.be.true);
		});

		it('HEAD /api/deckCard/:_id to verify deckCard exists in db', () => {
			const reqStub = { body: { deckCard: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(vReq, 'validate').resolves();
			sandbox.stub(vMongoId, 'validate').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const options = {
				port: config.app.dbAPI.port,
				path: '/api/deckCard/' + reqStub.body.deckCard,
				method: 'HEAD'
			};
			const expectedReqResult = { statusCode: resCode['OK'] };
			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCard.create(reqStub, resDummy)
				.then(() => httpRequestStub.calledWith(options).should.be.true);
		});

		it('reject if HEAD /api/deckCard/:_id res statusCode is 404', () => {
			const reqStub = { body: { deckCard: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(vReq, 'validate').resolves();
			sandbox.stub(vMongoId, 'validate').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const options = {
				port: config.app.dbAPI.port,
				path: '/api/deckCard/' + reqStub.body.deckCard,
				method: 'HEAD'
			};
			const expectedReqResult = { statusCode: resCode['NOTFOUND'] };
			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCard.create(reqStub).should.be.rejectedWith(errMsg.deckCardDoesNotExist);
		});

		// not a great test, not really checking error message is what I say it is...
		it.skip('reject if HEAD /api/deckCard/:_id res statusCode is not 404 or 200', () => {
			const reqStub = { body: { deckCard: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(vReq, 'validate').resolves();
			sandbox.stub(vMongoId, 'validate').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const options = {
				port: config.app.dbAPI.port,
				path: '/api/deckCard/' + reqStub.body.deckCard,
				method: 'HEAD'
			};
			const expectedReqResult = { statusCode: resCode['SERVFAIL'] };
			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCard.create(reqStub).should.be.rejectedWith(Error, errMsg.apiServfail);
		});

		// not a great test, how to test data gets resolved approrpatiedly 
		it.skip('resolve validated data if HEAD /api/deckCard/:_id res statusCode is 200', () => {
			const reqStub = { body: { deckCard: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(vReq, 'validate').resolves();
			sandbox.stub(vMongoId, 'validate').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const options = {
				port: config.app.dbAPI.port,
				path: '/api/deckCard/' + reqStub.body.deckCard,
				method: 'HEAD'
			};
			const expectedReqResult = { statusCode: resCode['OK'] };
			httpRequestStub.callsArgWith(1, expectedReqResult);
			const validatedDataStub = { deckCard: reqStub.body.deckCard };

			return userCard.create(reqStub)
				.then((validatedData) => {
					Object.keys(validatedDataStub)[0].should.equal(Object.keys(validatedData)[0]);
				});
		});

	});

});