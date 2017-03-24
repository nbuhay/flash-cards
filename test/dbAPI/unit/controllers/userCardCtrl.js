const http = require('http');
const str = require('appStrings').dbAPI.controllers.userCardCtrl;
const modulesStr = require('appStrings').modules;
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
const invalidMongoId = require('config').invalidMongoId();
const validMongoId = require('config').validMongoId();
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

describe('userCardCtrl.js', () => {

	describe('#findAll', () => {

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

	describe.only('#findById', () => {

		beforeEach(() => {
			errorHeader.message += 'findById: ';
		});

		it('function named FindById should exist', () => {
			expect(userCardCtrl.findById).to.exist;
		});

		it('should send a 400 if _id is not a valid Mongo ObjectID', () => {
			const reqStub = {
				params: {
					_id: invalidMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqSpy = sandbox.spy(jsonReq, 'validateMongoId');
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidMongoId;

			return userCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonReqSpy.callCount.should.equal(1);
					expect(jsonReqSpy.calledWithExactly(reqStub.params._id),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call UserCard.findById with _id as the only arg', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const userCardStub = sandbox.stub(UserCard, 'findById').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					userCardStub.callCount.should.equal(1);
					expect(userCardStub.calledWithExactly(reqStub.params._id),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 if UserCard.findById rejects', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const execStub = sandbox.stub().rejects();
			const userCardStub = sandbox.stub(UserCard, 'findById', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return userCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 404 if _id does\'t exist in UserCard collection', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const userCardDoesNotExist = null;
			const execStub = sandbox.stub().resolves(userCardDoesNotExist);
			const userCardStub = sandbox.stub(UserCard, 'findById', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return userCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 if _id exists in UserCard collection', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const userCardData = { user: {} };
			const execStub = sandbox.stub().resolves(userCardData);
			const userCardStub = sandbox.stub(UserCard, 'findById', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledWithExactly(resDummy, resCode['OK'], userCardData),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 but no data if req.method is HEAD and _id exists in UserCard collection', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				},
				method: 'HEAD'
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const userCardData = { user: {} };
			const execStub = sandbox.stub().resolves(userCardData);
			const userCardStub = sandbox.stub(UserCard, 'findById', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledWithExactly(resDummy, resCode['OK'], undefined),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#create', () => {

		beforeEach(() => {
			errorHeader.message += 'create: ';
		});

		it('function named create should exist', () => {
			expect(userCardCtrl.create).to.exist;
		});

		it('should call jsonReq.validateBody with req.body', () => {
			const reqStub = {
				body: {}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonReqStub.callCount.should.equal(1);
					expect(jsonReqStub.calledWithExactly(reqStub.body), 'calledWithExactly')
						.to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 when req.body.dekCard is undefined', () => {
			const reqStub = {
				body: {}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.undefinedDeckCard;

			return userCardCtrl.create(reqStub, resDummy)
				then(() => {
					jsonResStub.callCount.should.equal(1);
					expect(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 when req.body.dekCard is null', () => {
			const reqStub = {
				body: {
					deckCard: null 
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.nullDeckCard;

			return userCardCtrl.create(reqStub, resDummy)
				then(() => {
					jsonResStub.callCount.should.equal(1);
					expect(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call jsonReq.validateMongoId with req.body.deckCard', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId');
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonReqMongoStub.calledWithExactly(reqStub.body.deckCard),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should make a http GET to check the deckCard exists', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const options = {
				port: config.app.dbAPI.port,
				path: '/api/deckCard/' + reqStub.body.deckCard
			};
			const httpReqMock = sandbox.mock(http);

			httpReqMock.expects('request').once().withArgs(options);

			return userCardCtrl.create(reqStub, resDummy)
				.then(() => {
					httpReqMock.verify();
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 if http GET to check the deckCard exists fails', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['SERVFAIL'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);
			errorHeader.message += str.errMsg.apiServfail;

			return userCardCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					expect(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if req.body.deckCard does\'nt exist in the deckCard db', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['NOTFOUND'] };
			const jsonResStub = sinon.sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);
			errorHeader.message += str.errMsg.deckCardDoesNotExist;

			return userCardCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					expect(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 if UserCard.create throws an error', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const execStub = sandbox.stub().rejects();
			const userCardStub = sandbox.stub(UserCard, 'create', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);
			errorHeader.message += str.errMsg.checkQuery;

			return userCardCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					expect(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	it('should send a 200 if UserCard.create resolves', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqStub.body);
			const savedUserCardData = { data: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const execStub = sandbox.stub().resolves(savedUserCardData);
			const userCardStub = sandbox.stub(UserCard, 'create', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					expect(jsonResStub.calledWithExactly(resDummy, resCode['OK'], savedUserCardData),
						'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

});