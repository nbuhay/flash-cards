const config = require('config').config();
const resCode = require('config').resCode();
const userNameSettings = require('config').userNameSettings();
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
const Query = require('mongoose').Query;

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
			errorHeader.message += str.funcHeader.findAll;
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
						calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader),'calledWithExactly')
							.to.be.true;
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
						calledWithExactly(resDummy, resCode['OK'], userDataStub),'calledWithExactly')
							.to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#findById', () => {

		beforeEach(function() {
			errorHeader.message += str.funcHeader.findById;
		});

		it('function findById should exist', () => {
			expect(userCtrl.findById).to.be.exist;
		});

		it('should send 400 when req.params._id is an invalid MongoId', () => {
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
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should populate created decks', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().rejects();
			const populateStub = sandbox.stub(Query.prototype, 'populate');
			const userStub = sandbox.stub(User, 'findById',
				() => { return { populate: populateStub } });
			populateStub.onCall(0).returnsThis();
			populateStub.onCall(1).returnsThis();
			populateStub.onCall(2).returns({ exec: execStub });
			errorHeader.message += str.errMsg.checkQuery;

			const populateParm = { path: 'decks.created' };

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					populateStub.calledWithExactly(populateParm).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should populate learning decks', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().rejects();
			const populateStub = sandbox.stub(Query.prototype, 'populate');
			const userStub = sandbox.stub(User, 'findById',
				() => { return { populate: populateStub } });
			populateStub.onCall(0).returnsThis();
			populateStub.onCall(1).returnsThis();
			populateStub.onCall(2).returns({ exec: execStub });
			errorHeader.message += str.errMsg.checkQuery;

			const populateParm = { path: 'decks.learning.deck' };

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					populateStub.calledWithExactly(populateParm).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should populate all learning decks\' user cards', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().rejects();
			const populateStub = sandbox.stub(Query.prototype, 'populate');
			const userStub = sandbox.stub(User, 'findById',
				() => { return { populate: populateStub } });
			populateStub.onCall(0).returnsThis();
			populateStub.onCall(1).returnsThis();
			populateStub.onCall(2).returns({ exec: execStub });
			errorHeader.message += str.errMsg.checkQuery;

			const populateParm = {
				path: 'decks.learning.userCards',
				populate: { path: 'deckCard' }
			};

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					populateStub.calledWithExactly(populateParm).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 500 if User.findById rejects', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().rejects();
			const populateStub = sandbox.stub(Query.prototype, 'populate');
			const userStub = sandbox.stub(User, 'findById',
				() => { return { populate: populateStub } });
			populateStub.onCall(0).returnsThis();
			populateStub.onCall(1).returnsThis();
			populateStub.onCall(2).returns({ exec: execStub });
			errorHeader.message += str.errMsg.checkQuery;

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 404 if user _id does not exist in the db', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const userDoesNotExist = null;
			const execStub = sandbox.stub().resolves(userDoesNotExist);
			const populateStub = sandbox.stub(Query.prototype, 'populate');
			const userStub = sandbox.stub(User, 'findById', 
				() => { return { populate: populateStub } });
			populateStub.onCall(0).returnsThis();
			populateStub.onCall(1).returnsThis();
			populateStub.onCall(2).returns({ exec: execStub });
			errorHeader.message += str.errMsg.doesNotExist;

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 200 and user data if _id exists in the db', () => {
			const reqStub = {
				params: {
					_id: validMongoId
				}
			};
			const resDummy = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const userDataFromDb = { user: {} };
			const execStub = sandbox.stub().resolves(userDataFromDb);
			const populateStub = sandbox.stub(Query.prototype, 'populate');
			const userStub = sandbox.stub(User, 'findById', 
				() => { return { populate: populateStub } });
			populateStub.onCall(0).returnsThis();
			populateStub.onCall(1).returnsThis();
			populateStub.onCall(2).returns({ exec: execStub });

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
			const populateStub = sandbox.stub(Query.prototype, 'populate');
			const userStub = sandbox.stub(User, 'findById', 
				() => { return { populate: populateStub } });
			populateStub.onCall(0).returnsThis();
			populateStub.onCall(1).returnsThis();
			populateStub.onCall(2).returns({ exec: execStub });

			return userCtrl.findById(reqStub, resDummy)
				.then(() => {
					jsonResStub.callCount.should.equal(1);
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], undefined).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe.skip('#findOne', () => {

		beforeEach(() => {
			errorHeader.message += str.funcHeader.findOne;
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
					jsonReqStub.calledWithExactly(reqStub).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body does not have property queryParms', () => {
			const reqStub = { 
				body: {}
			};
			const resDummy = { res: {} };
			const reqBodyStub = {};
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParms;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms is undefined', () => {
			const reqStub = {
				body: {
					queryParms: undefined
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParms;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms is null', () => {
			const reqStub = {
				body: {
					queryParms: null
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParms;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms does not have property conditions', () => {
			const reqStub = {
				body: {
					queryParms: {}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParmsCond;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.conditions is undefined', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: undefined
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParmsCond;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.conditions is null', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: null
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParmsCond;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.projection equals undefined', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: {},
						projection: undefined
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParmsProj;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.projection equals null', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: {},
						projection: null
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParmsProj;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.options equals undefined', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: {},
						options: undefined
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParmsOpts;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms.options equals null', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: {},
						options: null
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParmsOpts;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms has projection and options fields and projection is equal to undefined', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: {},
						projection: undefined,
						options: {}
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParmsProj;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms has projection and options fields and projection is equal to null', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: {},
						projection: null,
						options: {}
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParmsProj;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms has projection and options fields and options is equal to undefined', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: {},
						projection: {},
						options: undefined
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParmsOpts;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.queryParms has projection and options fields and options is equal to null', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: {},
						projection: {},
						options: null
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidQueryParmsOpts;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call User.findOne(conditions, projection, options) if body.queryParms has projection and options fields', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: { conditions: {} },
						projection: { projection: {} },
						options: { options: {} }
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					debugger;
					userStub.calledWith(
						reqStub.body.queryParms.conditions,
						reqStub.body.queryParms.projection,
						reqStub.body.queryParms.options).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call User.findOne(conditions, projection, undefined) if body.queryParms has projection field but no option field', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: { conditions: {} },
						projection: { projection: {} }
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					userStub.calledWith(
						reqStub.body.queryParms.conditions,
						reqStub.body.queryParms.projection,
						undefined).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call User.findOne(conditions, undefined, options) if body.queryParms has options field but no projection field', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: { conditions: {} },
						options: { options: {} }
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					userStub.calledWith(
						reqStub.body.queryParms.conditions,
						undefined,
						reqStub.body.queryParms.options).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call User.findOne(conditions, undefined, undefined) if body.queryParms only has conditions', () => {
			const reqStub = {
				body: {
					queryParms: {
						conditions: { conditions: {} }
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const execStub = sandbox.stub().resolves();
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					userStub.calledWith(
						reqStub.body.queryParms.conditions,
						undefined,
						undefined).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 500 if User.findOne rejects', () =>{
			const reqStub = {
				body: {
					queryParms: {
						conditions: { conditions: {} }
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const execStub = sandbox.stub().rejects();
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 404 if User.findOne resolves null', () =>{
			const reqStub = {
				body: {
					queryParms: {
						conditions: { conditions: {} }
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const userDoesNotExist = null;
			const execStub = sandbox.stub().resolves(userDoesNotExist);
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 200 and the user data if User.findOne resolves', () =>{
			const reqStub = {
				body: {
					queryParms: {
						conditions: { conditions: {} }
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const userDataFromDb = { userData: {} };
			const execStub = sandbox.stub().resolves(userDataFromDb);
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], userDataFromDb)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 200 and null if User.find resolves and req.method is HEAD', () =>{
			const reqStub = {
				method: 'HEAD',
				body: {
					queryParms: {
						conditions: { conditions: {} }
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const userDataFromDb = { userData: {} };
			const execStub = sandbox.stub().resolves(userDataFromDb);
			const userStub = sandbox.stub(User, 'findOne', () => { return { exec: execStub }; });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.findOne(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], null)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#create', () => {

		beforeEach(() => {
			errorHeader.message += str.funcHeader.create;
		});

		it('function create should exist', () => {
			expect(userCtrl.create).to.exist;
		});

		it('should call jsonReq.validateBody passing req', () =>{
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCtrl.create(reqDummy, resDummy)
				.then(() => jsonReqStub.calledWithExactly(reqDummy).should.be.true)
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if jsonReq.validateBody rejects', () =>{
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const rejectReason = { message: 'generic reason' };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').rejects(rejectReason);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += rejectReason.message;

			return userCtrl.create(reqDummy, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.userName is undefined', () => {
			const reqStub = {
				body: {}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidUserName;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.userName.length is < userNameSettings.length.matching chars', () => {
			const invalidUserName = 'a'.repeat(userNameSettings.length.min - 1);
			const reqStub = {
				body: {
					userName: invalidUserName
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidUserName;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.userName.length is > userNameSettings.length.max chars', () => {
			const invalidUsername = 'a'.repeat(userNameSettings.length.max + 1);
			const reqStub = {
				body: {
					userName: invalidUsername
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidUserName;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.pswd is undefined', () => {
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const reqStub = {
				body: {
					userName: validUserName
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidPswd;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.pswd.length is < pswdSettings.length.min', () => {
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const invalidPswd = 'a'.repeat(pswdSettings.length.min - 1);
			const reqStub = {
				body: {
					userName: validUserName,
					pswd: invalidPswd
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidPswd;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.pswd.length is > pswdSettings.length.max', () => {
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const invalidPswd = 'a'.repeat(pswdSettings.length.max + 1);
			const reqStub = {
				body: {
					userName: validUserName,
					pswd: invalidPswd
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidPswd;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.email is undefined', () => {
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const reqStub = {
				body: {
					userName: validUserName,
					pswd: validPswd
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidEmail;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.email.domainId is undefined', () => {
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const reqStub = {
				body: {
					userName: validUserName,
					pswd: validPswd,
					email: {}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidEmail;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.email.domain is undefined', () => {
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const reqStub = {
				body: {
					userName: validUserName,
					pswd: validPswd,
					email: {
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidEmail;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.email.domain is undefined', () => {
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'a';
			const reqStub = {
				body: {
					userName: validUserName,
					pswd: validPswd,
					email: {
						domainId: domainId
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidEmail;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.email.extension is undefined', () => {
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'a';
			const domain = 'a';
			const reqStub = {
				body: {
					userName: validUserName,
					pswd: validPswd,
					email: {
						domainId: domainId,
						domain: domain
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidEmail;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if body.email is not a valid email', () => {
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'a';
			const domain = 'a';
			const extension = 'a';
			const reqStub = {
				body: {
					userName: validUserName,
					pswd: validPswd,
					email: {
						domainId: domainId,
						domain: domain,
						extension: extension
					}
				}
			};
			const resDummy = { res: {} };
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidEmail;

			return userCtrl.create(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send 400 if email already exists in db', () => {
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'valid';
			const domain = 'valid';
			const extension = 'com';
			const reqStub = {
				body: {
					userName: validUserName,
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
			const jsonReqStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			httpRequestStub.callsArgWith(1, expectedReqResult);
			errorHeader.message += str.errMsg.emailExists;

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
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'valid';
			const domain = 'valid';
			const extension = 'com';
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					userName: validUserName,
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
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'valid';
			const domain = 'valid';
			const extension = 'com';
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					userName: validUserName,
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
			const validUserName = 'a'.repeat(userNameSettings.length.min);
			const validPswd = 'a'.repeat(pswdSettings.length.min);
			const domainId = 'valid';
			const domain = 'valid';
			const extension = 'com';
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: {
					userName: validUserName,
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
			errorHeader.message += str.funcHeader.findByIdAndRemove;
		});

		it('function findByIdAndRemove should exist', () => {
			should.exist(userCtrl.findByIdAndRemove);
		});

		it('should call jsonReq.validateMongoId and pass it the User _id', () => {
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
					expect(jsonReqStub.calledWithExactly(reqDummy.params._id)).to.be.true;
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
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
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
					expect(userStub.calledWithExactly(reqDummy.params._id)).to.be.true;
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
			errorHeader.message += str.errMsg.checkQuery; 

			return userCtrl.findByIdAndRemove(reqDummy, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader)
						.should.be.true;
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
			errorHeader.message += str.errMsg.noUserMatch; 

			return userCtrl.findByIdAndRemove(reqDummy, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader)
						.should.be.true;
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
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], userDataFromDb)
						.should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});		

	});

	describe.skip('#findByIdAndUpdate', () => {

	});

	describe('#updateLearning', () => {
	
		beforeEach(() => {
			errorHeader.message += 'updateLearning: ';
		});

		it('function updateLearning should exist', () => {
			should.exist(userCtrl.updateLearning);
		});

		it('should call jsonReq.validateMongoId and pass it req.params.user_id', () => {
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

		it('should call jsonReq.validateMongoId and pass it req.params.deck_id', () => {
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

		it('should send a 400 if any req.body MongoId doesn\'t exist in UserCard collection', () => {
			const validMongoIdArray = [ { _id: validMongoId } ];
			const reqStub = {
				params: {
					user_id: validMongoId,
					deck_id: validMongoId
				},
				body: validMongoIdArray
			};
			const resDummy = { res: {} };
			const validateMongoIdStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const validateBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['NOTFOUND'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidBody;
			errorHeader.message += str.errMsg.userCardDoesNotExist;

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 if any HEAD /api/userCard/:_id return 500', () => {
			const validMongoIdArray = [ { _id: validMongoId } ];
			const reqStub = {
				params: {
					user_id: validMongoId,
					deck_id: validMongoId
				},
				body: validMongoIdArray
			};
			const resDummy = { res: {} };
			const validateMongoIdStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const validateBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedReqResult = { statusCode: resCode['SERVFAIL'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.invalidBody;
			errorHeader.message += str.errMsg.checkAPICall;

			httpRequestStub.callsArgWith(1, expectedReqResult);

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 if any PUT /api/userCard/:_id return 500', () => {
			const validMongoIdArray = [ { _id: validMongoId } ];
			const reqStub = {
				params: {
					user_id: validMongoId,
					deck_id: validMongoId
				},
				body: validMongoIdArray
			};
			const resDummy = { res: {} };
			const validateMongoIdStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const validateBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedHEADReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkAPICall;

			const options = {
				port: config.app.dbAPI.port,
				path: '/api/userCard/' + validMongoId,
				method: 'PUT'
			};
			const expectedPUTReqResult = { statusCode: resCode['SERVFAIL'] };

			httpRequestStub.callsArgWith(1, expectedHEADReqResult);
			httpRequestStub.withArgs(options).callsArgWith(1, expectedPUTReqResult);

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 if all PUT /api/userCard/:_id return 200', () => {
			const validMongoIdArray = [ { _id: validMongoId } ];
			const reqStub = {
				params: {
					user_id: validMongoId,
					deck_id: validMongoId
				},
				body: validMongoIdArray
			};
			const resDummy = { res: {} };
			const validateMongoIdStub = sandbox.stub(jsonReq, 'validateMongoId').resolves();
			const validateBodyStub = sandbox.stub(jsonReq, 'validateBody').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const expectedHEADReqResult = { statusCode: resCode['OK'] };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			const options = {
				port: config.app.dbAPI.port,
				path: '/api/userCard/' + validMongoId,
				method: 'PUT'
			};
			const expectedPUTReqResult = { statusCode: resCode['OK'] };

			httpRequestStub.callsArgWith(1, expectedHEADReqResult);
			httpRequestStub.withArgs(options).callsArgWith(1, expectedPUTReqResult);

			return userCtrl.updateLearning(reqStub, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['OK'], undefined).should.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

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