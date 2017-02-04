const str = require('appStrings').dbAPI.controllers.userCardCtrl;
const config = require('config').config();
const resCode = require('config').resCode();
const assert = require('chai').assert;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.should();
const should = require('chai').should();
const expect = require('chai').expect;
const userCardCtrl = require('dbAPI/controllers/userCardCtrl');
const sinon = require('sinon');
require('sinon-as-promised');
const jsonRes = require('modules/jsonResponse');
const jsonReq = require('modules/jsonRequest');
const UserCard = require('dbAPI/models/userCard');

var sandbox;
var errorHeader;

beforeEach(() => {
	errorHeader = { message: 'error:dbAPI.userCardCtrl.' };
	sandbox = sinon.sandbox.create();
});

afterEach(() => {
	sandbox.restore();
});

describe.only('userCardCtrl.js', () => {

	describe.only('#findAll', () => {

		beforeEach(function() {
			errorHeader.message += 'findAll: ';
		});

		it('function named findAll should exist', () => {
			expect(userCardCtrl.findAll).to.exist;
		});

		it('should call UserCardCtrl.findAll with the empty list as the only arg', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} }; 
			const conditions = {};
			const execStub = sandbox.stub().resolves();
			const userCardStub = sandbox.stub(UserCard, 'find').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes);

			return userCardCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					userCardStub.callCount.should.equal(1);
					userCardStub.calledWithExactly(conditions).should.be.true;
				});
		});

		it('should send a 500 when UserCard.find rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			
			errorHeader.message += str.errMsg.checkQuery;
			sandbox.stub(UserCard, 'find').returns({ exec: execStub });

			return userCardCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 and all UserCard data when UserCard.find resolves', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const allUserCardData = { userCards: {} };
			const execStub = sandbox.stub().resolves(allUserCardData);
			
			errorHeader.message += str.errMsg.checkQuery;
			sandbox.stub(UserCard, 'find').returns({ exec: execStub });

			return userCardCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], allUserCardData)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

});