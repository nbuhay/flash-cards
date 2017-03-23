const config = require('config').config();
const resCode = require('config').resCode();
const usernameSettings = require('config').usernameSettings();
const pswdSettings = require('config').pswdSettings();
const validMongoId = require('config').validMongoId();
const invalidMongoId = require('config').invalidMongoId();
const str = require('appStrings').dbAPI.controllers.userCtrl;
const modulesStr = require('appStrings').modules;
const assert = require('chai').assert;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.should();
const should = require('chai').should();
const expect = require('chai').expect;
const userCtrl = require('dbAPI/controllers/userCtrl');
const sinon = require('sinon');
require('sinon-as-promised');
const jsonRes = require('modules/jsonResponse');
const jsonReq = require('modules/jsonRequest');
const User = require('dbAPI/models/user');
const http = require('http');
const PassThrough = require('stream').PassThrough;

var sandbox;
var errorHeader;

beforeEach(() => {
	errorHeader = { message: 'error:dbAPI.userCtrl.' };
	sandbox = sinon.sandbox.create();
});

afterEach(() => {
	sandbox.restore();
});

describe('userCtrl.js', () => {

	describe('#findAll', () => {

		beforeEach(function() {
			errorHeader.message += 'findAll: ';
		});

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
			errorHeader.message += str.errMsg.checkQuery;

			return userCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					expect(userStub.calledOnce, 'User calledOnce').to.be.true;
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.
						calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader),'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 when User.find resolves', () => {
			const conditions = {};
			const resDummy = { res: {} };
			const reqDummy = { req: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const userDataStub = { users: {} };
			const execStub = sandbox.stub().resolves(userDataStub);
			const userStub = sandbox.stub(User, 'find', () => { return { exec: execStub }; });

			return userCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					expect(userStub.calledOnce, 'User calledOnce').to.be.true;
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.
						calledWithExactly(resDummy, resCode['OK'], userDataStub),'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#findById', () => {

		beforeEach(function() {
			errorHeader.message += 'findById: ';
		});

		it('function findById should exist', () => {
			expect(userCtrl.findById).to.be.exist;
		});

		it('should send a 400 when req.params._id is an invalid MongoId', () => {
			const reqStub = {
				params: {
					_id: invalidMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidMongoId;

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 if User.findById rejects', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().rejects();
			const userStub = sandbox.stub(User, 'findById', () => { return { exec: execStub }; });
			errorHeader.message += str.errMsg.checkQuery;

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 404 if user _id does not exist in the db', () => {
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
			errorHeader.message += str.errMsg.doesNotExist;

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 and user data if _id exists in the db', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const userDataFromDb = { user: {} };
			const execStub = sandbox.stub().resolves(userDataFromDb);
			const userStub = sandbox.stub(User, 'findById', () => { return { exec: execStub }; });

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], userDataFromDb).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 but no data if req.method is HEAD and _id exists in the db', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				},
				method: 'HEAD'
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const userDataFromDb = true;
			const execStub = sandbox.stub().resolves(userDataFromDb);
			const userStub = sandbox.stub(User, 'findById', () => { return { exec: execStub }; });
		
			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], undefined).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#findOne', () => {

		beforeEach(() => {
			errorHeader.message += 'findOne: ';
		});

		it('function findOne should exist', () => {
			expect(userCtrl.findOne).to.exist;
		});

		it('should call jsonRequest.validateBody with the req', () => {
			const reqStub = { req: {} };
			const resDummy = { res: {} };
			const validateBodyStub = sandbox.stub().resolves();
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonReqStub.calledWithExactly(reqStub).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body does not have property queryParms', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms is undefined', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: undefined
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms is null', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: null
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms does not have property conditions', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms.conditions';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.conditions is undefined', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: undefined
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms.conditions';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.conditions is null', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: null
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms.conditions';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.projection and its equal to undefined', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: {},
					projection: undefined
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms.projection';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.projection and its equal to null', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: {},
					projection: null
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms.projection';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.options and its equal to undefined', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: {},
					options: undefined
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms.options';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.options and its equal to null', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: {},
					options: null
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms.options';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms has projection and options fields and projection is equal to undefined', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: {},
					projection: undefined,
					options: {}
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms.projection';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms has projection and options fields and projection is equal to null', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: {},
					projection: null,
					options: {}
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms.projection';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms has projection and options fields and options is equal to undefined', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: {},
					projection: {},
					options: undefined
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms.options';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms has projection and options fields and options is equal to null', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: {},
					projection: {},
					options: null
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid queryParms.options';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call User.findOne(conditions, projection, options) if body.queryParms has projection and options fields', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: { conditions: {} },
					projection: { projection: {} },
					options: { options: {} }
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					userStub.calledWith(
						reqBodyStub.queryParms.conditions,
						reqBodyStub.queryParms.projection,
						reqBodyStub.queryParms.options).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call User.findOne(conditions, projection, undefined) if body.queryParms has projection field but no option field', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: { conditions: {} },
					projection: { projection: {} }
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					userStub.calledWith(
						reqBodyStub.queryParms.conditions,
						reqBodyStub.queryParms.projection,
						undefined).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call User.findOne(conditions, undefined, options) if body.queryParms has options field but no projection field', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: { conditions: {} },
					options: { options: {} }
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					userStub.calledWith(
						reqBodyStub.queryParms.conditions,
						undefined,
						reqBodyStub.queryParms.options).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call User.findOne(conditions, undefined, undefined) if body.queryParms only has conditions', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: { conditions: {} }
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					userStub.calledWith(
						reqBodyStub.queryParms.conditions,
						undefined,
						undefined).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 if User.findOne rejects', () =>{
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: { conditions: {} }
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const execStub = sandbox.stub().rejects();
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'undefined reason, check query';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 404 if User.findOne resolves null', () =>{
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: { conditions: {} }
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const userDoesNotExist = null;
			const execStub = sandbox.stub().resolves(userDoesNotExist);
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'no matching user found';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 and the user data if User.findOne resolves', () =>{
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: { conditions: {} }
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const userDataFromDb = { userData: {} };
			const execStub = sandbox.stub().resolves(userDataFromDb);
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], userDataFromDb)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 and null if User.find resolves and req.method is HEAD', () =>{
			const reqStub = {
				method: 'HEAD'
			};
			const resDummy = { res: {} };
			const reqBodyStub = {
				queryParms: {
					conditions: { conditions: {} }
				}
			};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves(reqBodyStub);
			const userDataFromDb = { userData: {} };
			const execStub = sandbox.stub().resolves(userDataFromDb);
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], null)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#create', () => {

		beforeEach(() => {
			errorHeader.message += 'create: ';
		});

		it('function create should exist', () => {
			expect(userCtrl.create).to.exist;
		});

		it('should send a 400 if header content-type is missing', () => {
			const reqStub = {
				headers: {}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if header content-type is not application/json', () => {
			const reqStub = {
				headers: {
					'content-type': 'text'
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body is undefined', () => {
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: undefined
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithMatch(resDummy, resCode['BADREQ']).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.username is undefined', () => {
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid username';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.username.length is less than 2 characters', () => {
			const invalidUsername = 'a'.repeat(usernameSettings.length.min - 1);
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: invalidUsername
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid username';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.username.length is less greater than 21 characters', () => {
			const invalidUsername = 'a'.repeat(usernameSettings.length.max + 1);
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: invalidUsername
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid username';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.pswd is undefined', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid pswd';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.pswd.length is less than pswdSettings.length.min', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const invalidPswd = 'a'.repeat(pswdSettings.length.min - 1);
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: invalidPswd
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid pswd';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.pswd.length is greater than pswdSettings.length.max', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const invalidPswd = 'a'.repeat(pswdSettings.length.max + 1);
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: invalidPswd
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid pswd';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.email is undefined', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: validPswd
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid email';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.email.domainId is undefined', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: validPswd,
					email: {}
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid email';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.email.domain is undefined', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: validPswd,
					email: {
					}
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid email';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.email.domain is undefined', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'a';
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: validPswd,
					email: {
						domainId: domainId
					}
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid email';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.email.extension is undefined', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'a';
			const domain = 'a';
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: validPswd,
					email: {
						domainId: domainId,
						domain: domain
					}
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid email';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if body.email is not a valid email', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'a';
			const domain = 'a';
			const extension = 'a';
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: validPswd,
					email: {
						domainId: domainId,
						domain: domain,
						extension: extension
					}
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'invalid email';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if email already exists in the db', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'valid';
			const domain = 'valid';
			const extension = 'com';
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: validPswd,
					email: {
						domainId: domainId,
						domain: domain,
						extension: extension
					}
				}
			};
			const resDummy = { res: {} };
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);
			errorHeader.message += 'user with email already exists';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(httpRequestStub.calledOnce, 'req calledOnce').to.be.true;
					expect(httpRequestStub.calledTwice, 'req not calledTwice').to.be.false;
					expect(jsonResStub.calledOnce, 'res calledOnce').to.be.true;
					expect(jsonResStub.calledTwice, 'res not calledTwice').to.be.false;
					expect(jsonResStub
						.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader),
							'res calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 when findOne api resCode is neither 200 or 404', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'valid';
			const domain = 'valid';
			const extension = 'com';
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: validPswd,
					email: {
						domainId: domainId,
						domain: domain,
						extension: extension
					}
				}
			};
			const resDummy = { res: {} };
			const httpRequestStub = sandbox.stub(http, 'request');
			const invalidResCode = 0;
			const expectedReqResult = { statusCode: invalidResCode };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);
			errorHeader.message += 'something went wrong with HEAD /api/user/findOne';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(httpRequestStub.calledOnce, 'req calledOnce').to.be.true;
					expect(httpRequestStub.calledTwice, 'req not calledTwice').to.be.false;
					expect(jsonResStub.calledOnce, 'res calledOnce').to.be.true;
					expect(jsonResStub.calledTwice, 'res not calledTwice').to.be.false;
					expect(jsonResStub
						.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader),
							'res calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 if User.create throws an error', () =>  {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'valid';
			const domain = 'valid';
			const extension = 'com';
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: validPswd,
					email: {
						domainId: domainId,
						domain: domain,
						extension: extension
					}
				}
			};
			const resDummy = { res: {} };
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['NOTFOUND'] };
			const execStub = sandbox.stub().rejects();
			const userStub = sandbox.stub(User, 'create', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);
			errorHeader.message += 'undefined reason, check query';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(httpRequestStub.calledOnce, 'req calledOnce').to.be.true;
					expect(httpRequestStub.calledTwice, 'req not calledTwice').to.be.false;
					expect(jsonResStub.calledOnce, 'res calledOnce').to.be.true;
					expect(jsonResStub.calledTwice, 'res not calledTwice').to.be.false;
					expect(jsonResStub
						.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader),
							'res calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 when user is saved to the db', () => {
			const validUsername = 'a'.repeat(usernameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'valid';
			const domain = 'valid';
			const extension = 'com';
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					username: validUsername,
					pswd: validPswd,
					email: {
						domainId: domainId,
						domain: domain,
						extension: extension
					}
				}
			};
			const resDummy = { res: {} };
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['NOTFOUND'] };
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'create', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const content = 'user creation successful';

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					expect(httpRequestStub.calledOnce, 'req calledOnce').to.be.true;
					expect(httpRequestStub.calledTwice, 'req not calledTwice').to.be.false;
					expect(jsonResStub.calledOnce, 'res calledOnce').to.be.true;
					expect(jsonResStub.calledTwice, 'res not calledTwice').to.be.false;
					expect(jsonResStub
						.calledWithExactly(resDummy, resCode['OK'], content),
							'res calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#findByIdAndRemove', () => {

		beforeEach(() => {
			errorHeader.message += 'findByIdAndRemove: ';
		});

		it('function findByIdAndRemove should exist', () => {
			should.exist(userCtrl.findByIdAndRemove);
		});

		it('should call jsonReq.validMongoId and pass it the User _id', () => {
			const dummyId = 'a';
			const reqDummy = { 
				params: {
					_id: dummyId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');


			return userCtrl.findByIdAndRemove(reqDummy, resDummy)
				.then(() => {
					jsonReqStub.callCount.should.equal(1);
					expect(jsonReqStub.calledWithExactly(reqDummy.params._id), 'calledWithExactly')
						.to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 when _id is an invalid MongoId', () => {
			const dummyId = 'a';
			const reqDummy = { 
				params: {
					_id: dummyId
				}
			};
			const resDummy = { res: {} };
			const rejectReason = 'invalid MongoId';
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').rejects(rejectReason);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += rejectReason;

			return userCtrl.findByIdAndRemove(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					expect(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader),
					 'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call User.findByIdAndRemove with the _id as the only arg', () => {
			const dummyId = 'a';
			const reqDummy = {
				params: {
					_id: dummyId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'findByIdAndRemove', 
				() => { return { exec: execStub }});
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findByIdAndRemove(reqDummy, resDummy)
				.then(() => {
					userStub.callCount.should.equal(1);
					expect(userStub.calledWithExactly(reqDummy.params._id), 'calledWithExactly')
						.to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 if User.findOneAndRemove rejects', () => {
			const dummyId = 'a';
			const reqDummy = {
				params: {
					_id: dummyId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const execStub = sandbox.stub().rejects();
			const userStub = sandbox.stub(User, 'findByIdAndRemove', 
				() => { return { exec: execStub }});
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'undefined reason, check query'; 

			return userCtrl.findByIdAndRemove(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					expect(jsonResStub
						.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader),
							'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 404 if User.findOneAndRemove returns null', () => {
			const dummyId = 'a';
			const reqDummy = {
				params: {
					_id: dummyId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const userDoesNotExist = null;
			const execStub = sandbox.stub().resolves(userDoesNotExist);
			const userStub = sandbox.stub(User, 'findByIdAndRemove', 
				() => { return { exec: execStub }});
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += 'no matching user found'; 

			return userCtrl.findByIdAndRemove(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					expect(jsonResStub
						.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader),
							'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 if User.findOneAndRemove sucessfully deletes user', () => {
			const dummyId = 'a';
			const reqDummy = {
				params: {
					_id: dummyId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const userDataFromDb = {};
			const execStub = sandbox.stub().resolves(userDataFromDb);
			const userStub = sandbox.stub(User, 'findByIdAndRemove', 
				() => { return { exec: execStub }});
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findByIdAndRemove(reqDummy, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					expect(jsonResStub
						.calledWithExactly(resDummy, resCode['OK'], userDataFromDb),
							'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});		

	});

	describe.skip('#findByIdAndUpdate', () => {

	});

	describe.only('#updateLearning', () => {
	
		beforeEach(() => {
			errorHeader.message += 'updateLearning: ';
		});

		it('function updateLearning should exist', () => {
			should.exist(userCtrl.updateLearning);
		});

		it('should call jsonReq.validMongoId and pass it req.params.user_id', () => {
			const reqStub = {
				params: {
					user_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonReqStub.calledWithExactly(reqStub.params.user_id).should.be.true;	
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if req.params.user_id is not a valid Mongo Id', () => {
			const reqStub = {
				params: {
					user_id: invalidMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidMongoId;

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;	
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call jsonReq.validMongoId and pass it req.params.deck_id', () => {
			const anotherValidMongoId = 'b'.repeat(24);
			const reqStub = {
				params: {
					user_id: validMongoId,
					deck_id: anotherValidMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonReqStub.calledWithExactly(reqStub.params.deck_id).should.be.true;	
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if req.params.deck_id is not a valid Mongo Id', () => {
			const reqStub = {
				params: {
					user_id: validMongoId,
					deck_id: invalidMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidMongoId;

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;	
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call jsonRequest.validateBody and pass it req.body', () => {
			const reqStub = { 
				params: {
					user_id: validMongoId,
					deck_id: validMongoId
				},
				body: {}
			};
			const resDummy = { res: {} };
			const validateMongoIdStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const validateBodyStub = sandbox.stub(jsonReq, 'validateBody');
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					validateBodyStub.calledWithExactly(reqStub.body).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if jsonRequest.validateBody rejects', () => {
			const reqStub = { 
				params: {
					user_id: validMongoId,
					deck_id: validMongoId
				},
				body: {}
			};
			const resDummy = { res: {} };
			const validateMongoIdStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const rejectReason = { message: 'generic reason' };
			const validateBodyStub = sandbox.stub(jsonReq, 'validateBody').rejects(rejectReason);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += rejectReason.message;

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if req.body is not an array', () => {
			const notAnArray = {};
			const reqStub = { 
				params: {
					user_id: validMongoId,
					deck_id: validMongoId
				},
				body: notAnArray
			};
			const resDummy = { res: {} };
			const validateMongoIdStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const validateBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidBody;
			errorHeader.message += str.errMsg.invalidArrayField + typeof reqStub.body;

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if req.body is empty', () => {
			const emptyArray = [];
			const reqStub = { 
				params: {
					user_id: validMongoId,
					deck_id: validMongoId
				},
				body: emptyArray
			};
			const resDummy = { res: {} };
			const validateMongoIdStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const validateBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidBody;
			errorHeader.message += str.errMsg.emptyArray;

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 400 if req.body contains any invalid MongoId', () => {
			const containsInvalidMongoId = [ { _id: validMongoId }, { _id: invalidMongoId } ];
			const reqStub = { 
				params: {
					user_id: validMongoId,
					deck_id: validMongoId
				},
				body: containsInvalidMongoId
			};
			const resDummy = { res: {} };
			const validateMongoIdStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			validateMongoIdStub.withArgs(invalidMongoId).rejects(modulesStr.jsonRequest.errMsg.invalidMongoId);
			const validateBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidBody;
			errorHeader.message += modulesStr.jsonRequest.errMsg.invalidMongoId;

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

			// NEED USER CARD IMPLEMENTED BEFORE CONTINUING
			//
			// HEAD on each userCard, verify exists
			// PUT for each userCard
			// but what if there is an error?
			//   what is course correct?
			//   how to handle already PUT data?
			// 500 if serve fail
			// 200 if update ok
	});

	describe.skip('#findByIdAndRemoveLearning', () => {
		
		beforeEach(() => {
			errorHeader.message += 'findByIdAndRemoveLearning: ';
		});

		it('function findByIdAndRemoveLearning should exist', () => {
			should.exist(userCtrl.findByIdAndRemoveLearning);
		});

	});

});