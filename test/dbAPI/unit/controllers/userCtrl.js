const config = require('config').config();
const resCode = require('config').resCode();
const usernameSettings = require('config').usernameSettings();
const pswdSettings = require('config').pswdSettings();
const assert = require('chai').assert;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.should();
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

		it('should send a 200 but no data if req.method is HEAD and _id exists in the db', () => {
			const validMongoId = 'a'.repeat(24);
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], undefined).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe.only('#findOne', () => {

		beforeEach(() => {
			errorHeader.message += 'findOne: ';
		});

		it('function findOne should exist', () => {
			expect(userCtrl.findOne).to.exist;
		});

		it('should call jsonRequest.validatBody with the req', () => {
			const reqStub = { req: {} };
			const resDummy = { res: {} };
			const validateBodyStub = sandbox.stub().resolves();
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonReqStub.calledOnce.should.be.true;
					jsonReqStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
			errorHeader.message += 'no matching user found';

			return userCtrl.findOne(reqDummy, resDummy)
				.then(() => {
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], userDataFromDb)
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
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
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it.skip('should send a 400 if email already exists in the db', () => {
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
			const httpRequestStub = sinon.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['OK'] };
			const responseStub = new PassThrough();
			const requestStub = new PassThrough();
			// const httpReqOptions = {
			// 	port: config.app.dbAPI.port,
			// 	path: '/api'
			// }
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			responseStub.write(JSON.stringify(expectedReqResult));
			// literally passing response to callback
 			//   callsArgWith says execute the index=1 param as callback 
 			//   AND pass 'response' as the argument to that callback
			httpRequestStub.callsArgWith(1, responseStub).returns(requestStub);
			errorHeader.message += 'user with email already exists';

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					httpRequestStub.calledOnce.should.be.true;
					httpRequestStub.calledTwice.should.be.false;
					// httpRequestStub should be called with what args?
					//   options
					//   callback...
					jsonResStub.calledOnce.should.be.true;
					jsonResStub.calledTwice.should.be.false;
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

// get: function(callback) {
// 		var req = http.request({
// 			hostname: 'jsonplaceholder.typicode.com',
// 			path: '/posts/1'
// 		}, function(response) {
// 			var data = '';
// 			response.on('data', function(chunk) {
// 				data += chunk;
// 			});
 
// 			response.on('end', function() {
// 				callback(null, JSON.parse(data));
// 			});
// 		});
 
// 		req.end();
// 	}


// it('should convert get result to object', function(done) {
// 	var expected = { hello: 'world' };
// 	var response = new PassThrough();
// 	response.write(JSON.stringify(expected));
// 	response.end();
 
// 	var request = new PassThrough();
 

// 	this.request.callsArgWith(1, response).returns(request);
 
// 	api.get(function(err, result) {
// 		assert.deepEqual(result, expected);
// 		done();
// 	});
// });
		// check user email doesn't already exist - 400 if exists
			// method search by email
				// Model.findOne function
				// http://mongoosejs.com/docs/api.html#model_Model.findOne
			// stub out http.request... or is it http.requestClient
			// https://codeutopia.net/blog/2015/01/30/how-to-unit-test-nodejs-http-requests/
		// 500 if create rejects
		// 200 if created
		// head option to check if exists before actually trying to save
		// domainId: {
		// domain: {
		// extension: {


	});


});