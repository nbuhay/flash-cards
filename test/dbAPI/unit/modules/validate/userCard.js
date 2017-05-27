const errMsg = require('appStrings').dbAPI.controllers.userCardCtrl.errMsg;
const userCard = require('dbAPI/modules/validate/userCard');
const vReq = require('dbAPI/modules/validate/req');
const vTypeof = require('dbAPI/modules/validate/typeof');
const vInstanceof = require('dbAPI/modules/validate/instanceof');
const http = require('http');
const config = require('config').config();
const vMongoId = require('dbAPI/modules/validate/mongoId');
const validMongoId = require('config').validMongoId();
const sinon = require('sinon');
const resCode = require('config').resCode();
const assert = require('chai').assert;
const isEqual = require('lodash').isEqual;

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
		it('reject if HEAD /api/deckCard/:_id res statusCode is not 404 or 200', () => {
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

		it('resolve validated data if HEAD /api/deckCard/:_id res statusCode is 200', () => {
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
			const dataStub = { deckCard: reqStub.body.deckCard };

			return userCard.create(reqStub).then((data) => assert(isEqual(data, dataStub)));
		});

	});

	describe('#findByIdAndRemove', () => {

		it('call mongoId.validate and pass req params _id', () => {
			const reqStub = { params: { _id: validMongoId } }; 
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').resolves();
			
			return userCard.findByIdAndRemove(reqStub)
				.then(() => assert(vMongoIdStub.calledWithExactly(validMongoId)));
		});

	});

	describe('#findByIdAndUpdate', () => {

		it('call req.validate and pass req', () => {
			const reqDummy = { req: {} };
			const vReqStub = sandbox.stub(vReq, 'validate').rejects();
			
			return userCard.findByIdAndUpdate(reqDummy)
				.catch(() => assert(vReqStub.calledWithExactly(reqDummy)));
		});

		it('call mongoId.validate and pass req params _id', () => {
			const reqStub = { params: { _id: validMongoId } }; 
			sandbox.stub(vReq, 'validate').resolves();
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').rejects();
			
			return userCard.findByIdAndUpdate(reqStub)
				.catch(() => vMongoIdStub.calledWithExactly(validMongoId).should.be.true);
		});

		it('reject if no desired body keys exist', () => {
			const reqStub = { params: { _id: validMongoId }, body: {} };
			sandbox.stub(vReq, 'validate').resolves();
			sandbox.stub(vMongoId, 'validate').resolves();

			return userCard.findByIdAndUpdate(reqStub).should.be.rejectedWith(errMsg.invalidUpdate);
		});

		it('cleanse undesired keys from req body', () => {
			const reqStub = {
				params: { _id: validMongoId }, 
				body: {
					gotCorrect: 'desired',
					lastSeen: 'desired',
					lastCorrect: 'desired',
					correctStreak: 'desired',
					incorrectStreak: 'desired',
					totalViews: 'desired',
					undesiredKey: 'not desired, not in UserCard schema'
				}
			};
			sandbox.stub(vReq, 'validate').resolves();
			sandbox.stub(vMongoId, 'validate').resolves();
			sandbox.stub(vTypeof, 'validate').resolves();
			sandbox.stub(vInstanceof, 'validate').resolves();

			return userCard.findByIdAndUpdate(reqStub)
				.then((data) => {
					debugger;
					(reqStub.body.hasOwnProperty('gotCorrect')).should.be.true;
					(reqStub.body.hasOwnProperty('lastSeen')).should.be.true;
					(reqStub.body.hasOwnProperty('lastCorrect')).should.be.true;
					(reqStub.body.hasOwnProperty('correctStreak')).should.be.true;
					(reqStub.body.hasOwnProperty('incorrectStreak')).should.be.true;
					(reqStub.body.hasOwnProperty('totalViews')).should.be.true;
					(!reqStub.body.hasOwnProperty('undesiredKey')).should.be.true;
				});
		});

		it('call validation on each key', () => {
			const reqStub = { 
				params: { _id: validMongoId }, 
				body: {
					gotCorrect: 'gotCorrect',
					lastSeen: 'lastSeen',
					lastCorrect: 'lastCorrect',
					correctStreak: 'correctStreak',
					incorrectStreak: 'incorrectStreak',
					totalViews: 'totalViews'
				}
			};
			sandbox.stub(vReq, 'validate').resolves();
			sandbox.stub(vMongoId, 'validate').resolves();
			const vTypeofStub = sandbox.stub(vTypeof, 'validate').resolves();
			const vInstanceofStub = sandbox.stub(vInstanceof, 'validate').resolves();

			return userCard.findByIdAndUpdate(reqStub)
				.then(() => {
					assert(vTypeofStub.calledWithExactly(reqStub.body.gotCorrect, 'boolean'));
					assert(vInstanceofStub.calledWithExactly(reqStub.body.lastSeen, Date));
					assert(vInstanceofStub.calledWithExactly(reqStub.body.lastCorrect, Date));
					assert(vTypeofStub.calledWithExactly(reqStub.body.correctStreak, 'number'));
					assert(vTypeofStub.calledWithExactly(reqStub.body.incorrectStreak, 'number'));
					assert(vTypeofStub.calledWithExactly(reqStub.body.totalViews, 'number'));
				});
		});

		it('resolve validated data', () => {
			const reqStub = { 
				params: { _id: validMongoId }, 
				body: {
					gotCorrect: 'gotCorrect',
					lastSeen: 'lastSeen',
					lastCorrect: 'lastCorrect',
					correctStreak: 'correctStreak',
					incorrectStreak: 'incorrectStreak',
					totalViews: 'totalViews'
				}
			};
			sandbox.stub(vReq, 'validate').resolves();
			sandbox.stub(vMongoId, 'validate').resolves();
			sandbox.stub(vTypeof, 'validate').resolves();
			sandbox.stub(vInstanceof, 'validate').resolves();

			return userCard.findByIdAndUpdate(reqStub)
				.then((data) => assert(isEqual(data, reqStub.body)));
		});

	});

});