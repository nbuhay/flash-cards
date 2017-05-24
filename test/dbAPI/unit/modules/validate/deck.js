const errMsg = require('appStrings').dbAPI.controllers.userCardCtrl.errMsg;
const deck = require('dbAPI/modules/validate/deck');
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

describe('deck.js', () => {

	describe('#findById', () => {

		it('pass req params _id to be validated', () => {
			const reqStub = { params: { _id: validMongoId } }; 
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').resolves();
			
			return deck.findById(reqStub)
				.then(() => vMongoIdStub.calledWithExactly(validMongoId).should.be.true);
		});

	});

	describe('#create', () => {
		
		it('call req.validate and pass req', () => {
			const reqDummy = { req: {} };
			const vReqStub = sandbox.stub(vReq, 'validate').rejects();
			
			return deck.create(reqDummy)
				.catch(() => vReqStub.calledWithExactly(reqDummy).should.be.true);
		});
		
		it('reject if desired body keys DNE', () => {
			const reqStub = { body: {} };
			sandbox.stub(vReq, 'validate').resolves();

			return deck.create(reqStub).should.be.rejectedWith(errMsg.invalidDeck);
		});

		it('call mongoId.validate and pass req body creator', () => {
			const reqStub = { 
				body: {
			 		creator: validMongoId,
			 		name: 'name',
			 		description: 'description',
			 		cards: ['cards']
				}
			}; 
			sandbox.stub(vReq, 'validate').resolves();
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').rejects();
			
			return deck.create(reqStub)
				.catch(() => vMongoIdStub.calledWithExactly(validMongoId).should.be.true);
		});

	});

});