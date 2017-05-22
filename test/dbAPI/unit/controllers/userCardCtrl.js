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
const invalidDate = require('config').invalidDate();
const validDate = require('config').validDate();
const jsonRes = require('modules/jsonResponse');
const jsonReq = require('modules/jsonRequest');
const UserCard = require('dbAPI/models/userCard');

var sandbox;
var errorHeader;

beforeEach(() => {
	errorHeader = {
		message: require('modules/errorHeader')(require.resolve('dbAPI/controllers/userCardCtrl')) 
	};
	sandbox = sinon.sandbox.create();
});

afterEach(() => sandbox.restore());

describe('userCardCtrl.js', () => {

	describe('#findAll', () => {

		beforeEach(() => { errorHeader.message += str.funcHeader.findAll; });

		it('#findAll should exist', () => expect(userCardCtrl.findAll).to.exist);

		it('call UserCardCtrl.find and pass empty list', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} }; 
			const conditions = {};
			const execStub = sandbox.stub().rejects();
			const userCardStub = sandbox.stub(UserCard, 'find').returns({ exec: execStub });

			return userCardCtrl.findAll(reqDummy, resDummy)
				.catch(() => userCardStub.calledWithExactly(conditions).should.be.true);
		});

		it('send 500 if UserCard.find rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			sandbox.stub(UserCard, 'find').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return userCardCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
				});
		});

		it('send 200 and all UserCard data when UserCard.find resolves', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const allUserCardData = { userCards: {} };
			const execStub = sandbox.stub().resolves(allUserCardData);
			sandbox.stub(UserCard, 'find').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;
			
			return userCardCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], allUserCardData));
				});
		});

	});

	describe('#findById', () => {

		beforeEach(() => {
			errorHeader.message += 'findById: ';
		});

		it('function named FindById should exist', () => {
			expect(userCardCtrl.findById).to.exist;
		});

		it('should send 400 if _id is not a valid Mongo ObjectID', () => {
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

		it('should send 500 if UserCard.findById rejects', () => {
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

		it('should send 404 if _id does\'t exist in UserCard collection', () => {
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

		it('should send 200 if _id exists in UserCard collection', () => {
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

		it('should send 200 but no data if req.method is HEAD and _id exists in UserCard collection', () => {
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
			errorHeader.message += str.funcHeader.create;
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
					expect(jsonReqStub.calledWithExactly(reqStub.body)).to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 when req.body.deckCard is undefined', () => {
			const reqStub = {
				body: {}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.undefinedDeckCard;

			return userCardCtrl.create(reqStub, resDummy)
				then(() => {
					expect(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader))
						.to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 when req.body.deckCard is null', () => {
			const reqStub = {
				body: {
					deckCard: null 
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
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

		it.skip('should call jsonReq.validateMongoId with req.body.deckCard', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId');
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonReqMongoStub.calledWithExactly(reqStub.body.deckCard)).to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should make a http HEAD to check the deckCard exists', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const options = {
				port: config.app.dbAPI.port,
				path: '/api/deckCard/' + reqStub.body.deckCard,
				method: 'HEAD'
			};
			const httpReqMock = sandbox.mock(http);

			httpReqMock.expects('request').once().withArgs(options);

			return userCardCtrl.create(reqStub, resDummy)
				.then(() => httpReqMock.verify())
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 500 if http HEAD to check the deckCard exists fails', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['SERVFAIL'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);
			errorHeader.message += str.errMsg.apiServfail;

			return userCardCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader))
						.to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if req.body.deckCard does\'nt exist in the deckCard db', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['NOTFOUND'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);
			errorHeader.message += str.errMsg.deckCardDoesNotExist;

			return userCardCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader))
						.to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 500 if UserCard.create throws an error', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
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
					expect(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader))
						.to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	it('should send 200 if UserCard.create resolves', () => {
			const reqStub = {
				body: {
					deckCard: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
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
					expect(jsonResStub.calledWithExactly(resDummy, resCode['OK'], savedUserCardData))
						.to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

describe('#findByIdAndUpdate', () => {

		beforeEach(() => {
			errorHeader.message += str.funcHeader.findByIdAndUpdate;
		});

		it('function named findByIdAndUpdate should exist', () => {
			expect(userCardCtrl.findByIdAndUpdate).to.exist;
		});

		it('should call jsonReq.validateMongoId with req.params._id', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					jsonReqStub.calledWithExactly(reqStub.params._id).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if jsonReq.validateMongoId rejects', () => {
			const reqStub = {
				params: {
					_id: invalidMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId')
				.rejects(modulesStr.jsonRequest.errMsg.invalidMongoId);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidMongoId;

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call jsonReq.validateBody with req.body', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: {}
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					jsonReqBodyStub.calledWithExactly(reqStub.body).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if jsonReq.validateBody rejects', () => {
			const invalidReqBody = {};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody')
				.rejects(modulesStr.jsonRequest.errMsg.invalidReqBody);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidReqBody;

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if jsonReq.validateMongoId rejects req.body.deckCard', () => {
			const invalidReqBody = {
				deckCard: invalidMongoId
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			jsonReqMongoStub.withArgs(invalidReqBody.deckCard).rejects(str.errMsg.undefinedDeckCard)
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.funcHeader.validateFindByIdAndUpdate;
			errorHeader.message += str.errMsg.undefinedDeckCard;

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if req.body.deckCard doesn\'t exist in deckCard collection', () => {
			const validReqBody = {
				deckCard: validMongoId
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: validReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['NOTFOUND'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.funcHeader.validateFindByIdAndUpdate;
			errorHeader.message += str.errMsg.deckCardDoesNotExist;

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.gotCorrect to false if it\'s undefined', () => {
			const invalidUserCardReqBody = {
				deckCard: validMongoId
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.gotCorrect).to.equal(false);
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.gotCorrect to false if it\'s not a Boolean', () => {
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: 'NotBoolean'
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.gotCorrect).to.equal(false);
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.lastSeen to current Date if it\'s undefined', () => {
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.lastSeen instanceof Date 
						&& !isNaN(reqStub.body.lastSeen.valueOf())).to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.lastSeen to current Date if it\'s not a Date object', () => {
			const notDateObject = true;
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: notDateObject
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.lastSeen instanceof Date 
						&& !isNaN(reqStub.body.lastSeen.valueOf())).to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.lastSeen to current Date if it\'s an invalid Date', () => {
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: invalidDate
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.lastSeen instanceof Date 
						&& !isNaN(reqStub.body.lastSeen.valueOf())).to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.lastCorrect to current Date if it\'s undefined', () => {
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: validDate,
				lastSeen: validDate
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.lastCorrect instanceof Date 
						&& !isNaN(reqStub.body.lastCorrect.valueOf())).to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.lastSeen to current Date if it\'s not a Date object', () => {
			const notDateObject = true;
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: validDate,
				lastCorrect: notDateObject
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.lastCorrect instanceof Date 
						&& !isNaN(reqStub.body.lastCorrect.valueOf())).to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.lastCorrect to current Date if it\'s not a valid Date', () => {
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: validDate,
				lastCorrect: invalidDate
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.lastCorrect instanceof Date 
						&& !isNaN(reqStub.body.lastCorrect.valueOf())).to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.correctStreak to 0 if it\'s undefined', () => {
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: validDate,
				lastCorrect: validDate
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.correctStreak).to.equal(0);
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.correctStreak to 0 if it\'s NaN', () => {
			const notNumber = true;
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: validDate,
				lastCorrect: validDate,
				correctStreak: notNumber
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.correctStreak).to.equal(0);
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.incorrectStreak to 0 if it\'s undefined', () => {
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: validDate,
				lastCorrect: validDate,
				correctStreak: 0
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.incorrectStreak).to.equal(0);
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.incorrectStreak to 0 if it\'s NaN', () => {
			const notNumber = true;
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: validDate,
				lastCorrect: validDate,
				correctStreak: 0,
				incorrectStreak: notNumber
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.incorrectStreak).to.equal(0);
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.totalViews to 0 if it\'s undefined', () => {
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: validDate,
				lastCorrect: validDate,
				correctStreak: 0,
				incorrectStreak: 0
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.totalViews).to.equal(0);
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should default req.body.totalViews to 0 if it\'s NaN', () => {
			const notNumber = true;
			const invalidUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: validDate,
				lastCorrect: validDate,
				correctStreak: 0,
				incorrectStreak: 0,
				totalViews: notNumber
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: invalidUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					expect(reqStub.body.totalViews).to.equal(0);
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call UserCard.findByIdAndUpdate with the validated req.body', () => {
			const validUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: validDate,
				lastCorrect: validDate,
				correctStreak: 0,
				incorrectStreak: 0,
				totalViews: 0
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: validUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const execStub = sandbox.stub().resolves();
			const userCardStub = sandbox.stub(UserCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					const updateData = {
						gotCorrect: validUserCardReqBody.gotCorrect,
						lastSeen: validUserCardReqBody.lastSeen,
						lastCorrect: validUserCardReqBody.lastCorrect,
						correctStreak: validUserCardReqBody.correctStreak,
						incorrectStreak: validUserCardReqBody.incorrectStreak,
						totalViews: validUserCardReqBody.totalViews
					};
					userCardStub.calledWithExactly(reqStub.params._id, updateData).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 500 when UserCard.findByIdAndUpdate rejects', () => {
			const validUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: validDate,
				lastCorrect: validDate,
				correctStreak: 0,
				incorrectStreak: 0,
				totalViews: 0
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: validUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const execStub = sandbox.stub().rejects();
			const userCardStub = sandbox.stub(UserCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					debugger;
					jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 200 when UserCard.findByIdAndUpdate resolves', () => {
			const validUserCardReqBody = {
				deckCard: validMongoId,
				gotCorrect: true,
				lastSeen: validDate,
				lastCorrect: validDate,
				correctStreak: 0,
				incorrectStreak: 0,
				totalViews: 0
			};
			const reqStub = {
				params: {
					_id: validMongoId
				},
				body: validUserCardReqBody
			};
			const resDummy = { res: {} };
			const jsonReqMongoStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonReqBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const execStub = sandbox.stub().resolves();
			const userCardStub = sandbox.stub(UserCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					debugger;
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], undefined).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

});