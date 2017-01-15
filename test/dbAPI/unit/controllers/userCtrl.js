const resCode = require('config').resCode();
const assert = require('chai').assert;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.should();
const expect = require('chai').expect;
const userCtrl = require('dbAPI/controllers/userCtrl');
const sinon = require('sinon');
require('sinon-as-promised');
const jsonRes = require('modules/jsonResponse');
const User = require('dbAPI/models/user');

var sandbox;

beforeEach(() => {
	sandbox = sinon.sandbox.create();
});

afterEach(() => {
	sandbox.restore();
});


describe('userCtrl.js', () => {

	describe('#findAll', () => {

		it('function named findAll should exist', () => {
			expect(userCtrl.findAll).to.exist;
		});

		it('should call User.find with conditions equal to a empty object', () => {
			const conditions = {};
			const resDummy = { res: {} };
			const reqDummy = { req: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'find', () => { return { exec: execStub } });

			return userCtrl.findAll(resDummy, reqDummy)
				.then(() => {
					expect(userStub.calledOnce, 'calledOnce').to.be.true;
					expect(userStub.calledWithExactly(conditions), 'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 when User.find rejects', () => {
			const conditions = {};
			const resDummy = { res: {} };
			const reqDummy = { req: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().rejects();
			const userStub = sandbox.stub(User, 'find', () => { return { exec: execStub } });

			return userCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					expect(userStub.calledOnce, 'User calledOnce').to.be.true;
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.
						calledWithMatch(resDummy, resCode['SERVFAIL']),'calledWithMatch').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 when User.find resolves', () => {
			const conditions = {};
			const resDummy = { res: {} };
			const reqDummy = { req: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'find', () => { return { exec: execStub }; });

			return userCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					expect(userStub.calledOnce, 'User calledOnce').to.be.true;
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.
						calledWithMatch(resDummy, resCode['OK']),'calledWithMatch').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#findById', () => {

		it('function findById should exist', () => {
			expect(userCtrl.findById).to.be.exist;
		});

		it('should send a 400 when req.params._id is an invalid MongoId', () => {
			const invalidMongoId = 'a'.repeat(23);
			const reqStub = {
				params: {
					_id: invalidMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.not.be.true;
					jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 if User.findById rejects', () => {
			const validMongoId = 'a'.repeat(24);
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().rejects();
			const userStub = sandbox.stub(User, 'findById', () => { return { exec: execStub }; });

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.not.be.true;
					jsonResStub.calledWithMatch(resDummy, resCode['SERVFAIL']).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 404 if user _id does not exist in the db', () => {
			const validMongoId = 'a'.repeat(24);
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const userDoesNotExist = null;
			const execStub = sandbox.stub().resolves(userDoesNotExist);
			const userStub = sandbox.stub(User, 'findById', () => { return { exec: execStub }; });

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
					jsonResStub.calledWithMatch(resDummy, resCode['NOTFOUND']).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 and user data if _id exists in the db', () => {
			const validMongoId = 'a'.repeat(24);
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const userDataFromDb = true;
			const execStub = sandbox.stub().resolves(userDataFromDb);
			const userStub = sandbox.stub(User, 'findById', () => { return { exec: execStub }; });

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], userDataFromDb).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

});