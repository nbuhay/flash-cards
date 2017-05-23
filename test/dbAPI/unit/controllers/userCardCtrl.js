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
const Validate = require('dbAPI/modules/validateFactory').UserCard;

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

		beforeEach(() => errorHeader.message += str.funcHeader.findById);

		it('#findById should exist', () => expect(userCardCtrl.findById).to.exist);

		it('call Validate.findById and pass req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findById').rejects();

			return userCardCtrl.findById(reqDummy, resDummy)
				.catch(() => validateStub.calledWithExactly(reqDummy).should.be.true);
		});

		it('send 400 if if Validate.findById rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			sandbox.stub(Validate, 'findById').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return userCardCtrl.findById(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));
				});
		});

		it('call UserCard.findById and pass req params _id', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findById').resolves();
			const userCardStub = sandbox.stub(UserCard, 'findById').rejects();

			return userCardCtrl.findById(reqStub, resDummy)
				.catch(() => assert(userCardStub.calledWithExactly(reqStub.params._id)));
		});

		it('send 500 if UserCard.findById rejects', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findById').resolves();
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			sandbox.stub(UserCard, 'findById').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return userCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
				});
		});

		it('send 404 if _id DNE in UserCard collection', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findById').resolves();
			const userCardDoesNotExist = null;
			const execStub = sandbox.stub().resolves(userCardDoesNotExist);
			sandbox.stub(UserCard, 'findById').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return userCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader));
				});
		});

		it('send 200 and UserCard if _id UserCard exists in collection', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findById').resolves();
			const userCardData = { user: {} };
			const execStub = sandbox.stub().resolves(userCardData);
			sandbox.stub(UserCard, 'findById').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], userCardData));
				});
		});

		it('send 200 and no data if req method is HEAD and _id exists in collection', () => {
			const reqStub = { params: { _id: validMongoId }, method: 'HEAD' };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findById').resolves();
			const userCardData = { user: {} };
			const execStub = sandbox.stub().resolves(userCardData);
			sandbox.stub(UserCard, 'findById').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.findById(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], undefined));
				});
		});

	});

	describe('#create', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.create);

		it('#create should exist', () => expect(userCardCtrl.create).to.exist);

		it('call Validate.create and pass req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'create').rejects();

			return userCardCtrl.create(reqDummy, resDummy)
				.catch(() => assert(validateStub.calledWithExactly(reqDummy)));
		});

		it('send 400 if Validate.create rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			sandbox.stub(Validate, 'create').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return userCardCtrl.create(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader));
				});
		});

		it('send 500 if Validate.create rejects with apiServfail', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: str.errMsg.apiServfail };
			sandbox.stub(Validate, 'create').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.apiServfail;

			return userCardCtrl.create(reqDummy, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
				});
		});

		it('call UserCard.create and pass returned data from Validate.create', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validatedData = { data: {} };
			sandbox.stub(Validate, 'create').resolves(validatedData);
			const execStub = sandbox.stub().rejects();
			const userCardStub = sandbox.stub(UserCard, 'create').returns({ exec: execStub });

			return userCardCtrl.create(reqDummy, resDummy)
				.catch(() => assert(userCardStub.calledWithExactly(validatedData)));
		});

		it('send 500 if UserCard.create rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validatedData = { data: {} };
			sandbox.stub(Validate, 'create').resolves(validatedData);
			const execStub = sandbox.stub().rejects();
			const userCardStub = sandbox.stub(UserCard, 'create').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return userCardCtrl.create(reqDummy, resDummy).then(() => 
				assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader)));
		});

		it('send 200 and new UserCard if UserCard.create resolves', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validatedData = { data: {} };
			sandbox.stub(Validate, 'create').resolves(validatedData);
			const newUserCard = { userCard: {} };
			const execStub = sandbox.stub().resolves(newUserCard);
			sandbox.stub(UserCard, 'create').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.create(reqDummy, resDummy).then(() => 
				assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], newUserCard)));
		});

	});

	describe('#findByIdAndRemove', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.findByIdAndRemove);

		it('#findByIdAndRemove should exist', () => expect(userCardCtrl.findByIdAndRemove).to.exist);

		it('call Validate.findByIdAndRemove and pass req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findByIdAndRemove').rejects();

			return userCardCtrl.findByIdAndRemove(reqDummy, resDummy)
				.catch(() => assert(validateStub.calledWithExactly(reqDummy)));
		});

		it('send 400 if Validate.findByIdAndRemove rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			sandbox.stub(Validate, 'findByIdAndRemove').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return userCardCtrl.findByIdAndRemove(reqDummy, resDummy)
				.then(() => assert(jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader)));
		});

		it('call UserCard.findByIdAndRemove and pass req params _id', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndRemove').resolves();
			const userCardStub = sandbox.stub(UserCard, 'findByIdAndRemove').rejects();

			return userCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.catch(() => assert(userCardStub.calledWithExactly(reqStub.params._id)));
		});

		it('send 500 if UserCard.findByIdAndRemove rejects', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndRemove').resolves();
			const execStub = sandbox.stub().rejects();
			const userCardStub = sandbox.stub(UserCard, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return userCardCtrl.findByIdAndRemove(reqStub, resDummy).then(() => 
				assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader)));		
		});

		it('send 404 if _id DNE in UserCard collection', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndRemove').resolves(reqStub.body);
			const returnedUserCardStub = null;
			const execStub = sandbox.stub().resolves(returnedUserCardStub);
			sandbox.stub(UserCard, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return userCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader));
				});
		});

		it('send 200 and removed UserCard if _id is removed from the collection', () => {
			const reqStub = { params: { _id: validMongoId } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndRemove').resolves();
			const returnedUserCardStub = { userCard: {} };
			const execStub = sandbox.stub().resolves(returnedUserCardStub);
			sandbox.stub(UserCard, 'findByIdAndRemove').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.findByIdAndRemove(reqStub, resDummy)
				.then(() => {
						assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], returnedUserCardStub));
				});
		});

	});

	describe('#findByIdAndUpdate', () => {

		beforeEach(() => errorHeader.message += str.funcHeader.findByIdAndUpdate);

		it('#findByIdAndUpdate should exist', () => assert(userCardCtrl.findByIdAndUpdate));

		it('call Validate.findByIdAndUpdate and pass req', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const validateStub = sandbox.stub(Validate, 'findByIdAndUpdate').rejects();

			return userCardCtrl.findByIdAndUpdate(reqDummy, resDummy)
				.catch(() => assert(validateStub.calledWithExactly(reqDummy)));
		});

		it('send 400 if Validate.findByIdAndUpdate rejects', () => {
			const reqDummy = { req: {} };
			const resDummy = { res: {} };
			const content = { message: 'invalid' };
			const validateStub = sandbox.stub(Validate, 'findByIdAndUpdate').rejects(content);
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += content.message;

			return userCardCtrl.findByIdAndUpdate(reqDummy, resDummy)
				.then(() => {
					jsonResStub.calledWithExactly(resDummy, resCode['BADREQ'], errorHeader).should.be.true;
			});	
		});

		it('call UserCard.findByIdAndUpdate and pass req params _id, validated req data,' + 
			'and options to return the updated object',() => {
			const reqStub = { params: { _id: validMongoId }, body: { gotCorrect: 'gotCorrect' } };
			const resDummy = { res: {} };
			const options = { new: true };
			sandbox.stub(Validate, 'findByIdAndUpdate').resolves(reqStub.body);
			const deckCardStub = sandbox.stub(UserCard, 'findByIdAndUpdate').rejects();

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.catch(() => {
					assert(deckCardStub.calledWithExactly(reqStub.params._id, reqStub.body, options));
			});
		});

		it('send 500 if UserCard.findByIdAndUpdate rejects', () => {
			const reqStub = { params: { _id: validMongoId }, body: { gotCorrect: 'gotCorrect' } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndUpdate').resolves(reqStub.body);
			const queryErrorSendsUndefinedReason = undefined;
			const execStub = sandbox.stub().rejects(queryErrorSendsUndefinedReason);
			sandbox.stub(UserCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.checkQuery;

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['SERVFAIL'], errorHeader));
				});
		});

		it('send 404 if req params _id DNE exist in the db', () => {
			const reqStub = { params: { _id: validMongoId }, body: { gotCorrect: 'gotCorrect' } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndUpdate').resolves(reqStub.body);
			const returnedUserCardStub = null;
			const execStub = sandbox.stub().resolves(returnedUserCardStub);
			sandbox.stub(UserCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			errorHeader.message += str.errMsg.doesNotExist;

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
					assert(jsonResStub.calledWithExactly(resDummy, resCode['NOTFOUND'], errorHeader));
				});
		});

		it('send 200 and the updated UserCard if UserCard.findByIdAndUpdate resolves', () => {
			const reqStub = { params: { _id: validMongoId }, body: { gotCorrect: 'gotCorrect' } };
			const resDummy = { res: {} };
			sandbox.stub(Validate, 'findByIdAndUpdate').resolves(reqStub.body);
			const returnedUserCardStub = { userCard: {} };
			const execStub = sandbox.stub().resolves(returnedUserCardStub);
			sandbox.stub(UserCard, 'findByIdAndUpdate').returns({ exec: execStub });
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return userCardCtrl.findByIdAndUpdate(reqStub, resDummy)
				.then(() => {
						assert(jsonResStub.calledWithExactly(resDummy, resCode['OK'], returnedUserCardStub));
				});
		});

	});

});