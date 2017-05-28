const errMsg = require('appStrings').dbAPI.controllers.userCardCtrl.errMsg;
const deck = require('dbAPI/modules/validate/deck');
const vReq = require('dbAPI/modules/validate/req');
const vTypeof = require('dbAPI/modules/validate/typeof');
const vInstanceof = require('dbAPI/modules/validate/instanceof');
const vStringArray = require('dbAPI/modules/validate/stringArray');
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
		
		it('reject if reqired body keys DNE', () => {
			const reqStub = { body: {} };
			sandbox.stub(vReq, 'validate').resolves();

			return deck.create(reqStub).should.be.rejectedWith(errMsg.invalidDeck);
		});

		it('HEAD /api/user/:_id to verify user exists in db', () => {
			const reqStub = { 
				body: {
			 		creator: validMongoId,
			 		name: 'name',
			 		description: 'description',
			 		cards: ['cards']
				}
			}; 
			const resDummy = { res: {} };
			sandbox.stub(vReq, 'validate').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const options = {
				port: config.app.dbAPI.port,
				path: '/api/user/' + reqStub.body.creator,
				method: 'HEAD'
			};
			const expectedReqResult = { statusCode: resCode['OK'] };
			httpRequestStub.callsArgWith(1, expectedReqResult);

			return deck.create(reqStub, resDummy)
				.then(() => httpRequestStub.calledWith(options).should.be.true);
		});

		it('reject if HEAD /api/user/:_id res statusCode is 404', () => {
			const reqStub = { 
				body: {
			 		creator: validMongoId,
			 		name: 'name',
			 		description: 'description',
			 		cards: ['cards']
				}
			};
			const resDummy = { res: {} };
			sandbox.stub(vReq, 'validate').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const options = {
				port: config.app.dbAPI.port,
				path: '/api/user/' + reqStub.body.creator,
				method: 'HEAD'
			};
			const expectedReqResult = { statusCode: resCode['NOTFOUND'] };
			httpRequestStub.callsArgWith(1, expectedReqResult);

			return deck.create(reqStub).should.be.rejectedWith(errMsg.userDNE);
		});

		it('reject if HEAD /api/user/:_id res statusCode is not 404 or 200', () => {
			const reqStub = { 
				body: {
			 		creator: validMongoId,
			 		name: 'name',
			 		description: 'description',
			 		cards: ['cards']
				}
			};
			const resDummy = { res: {} };
			sandbox.stub(vReq, 'validate').resolves();
			const httpRequestStub = sandbox.stub(http, 'request');
			const options = {
				port: config.app.dbAPI.port,
				path: '/api/user/' + reqStub.body.creator,
				method: 'HEAD'
			};
			const expectedReqResult = { statusCode: resCode['SERVFAIL'] };
			httpRequestStub.callsArgWith(1, expectedReqResult);

			return deck.create(reqStub).should.be.rejectedWith(Error, errMsg.apiServfail);
		});

		it('cleanse undesired req body keys', () => {
			const reqStub = { 
				body: {
			 		creator: validMongoId,
			 		name: 'name',
			 		description: 'description',
			 		cards: ['cards'],
			 		undersiredKey: 'undesired'
				}
			}; 
			sandbox.stub(vReq, 'validate').resolves();
			const expectedReqResult = { statusCode: resCode['OK'] };
			sandbox.stub(http, 'request').callsArgWith(1, expectedReqResult);
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').resolves();
			const vTypeofStub = sandbox.stub(vTypeof, 'validate').resolves();
			const vInstanceofStub = sandbox.stub(vInstanceof, 'validate').resolves();

			return deck.create(reqStub)
				.then(() => {
					(reqStub.body.hasOwnProperty('creator')).should.be.true;
					(reqStub.body.hasOwnProperty('name')).should.be.true;
					(reqStub.body.hasOwnProperty('description')).should.be.true;
					(reqStub.body.hasOwnProperty('cards')).should.be.true;
					(!reqStub.body.hasOwnProperty('undesiredKey')).should.be.true;
				});
		});

		it('call validation on all required body keys', () => {
			const reqStub = { 
				body: {
			 		creator: validMongoId,
			 		name: 'name',
			 		description: 'description',
			 		cards: ['cards']
				}
			}; 
			sandbox.stub(vReq, 'validate').resolves();
			const expectedReqResult = { statusCode: resCode['OK'] };
			sandbox.stub(http, 'request').callsArgWith(1, expectedReqResult);
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').resolves();
			const vTypeofStub = sandbox.stub(vTypeof, 'validate').resolves();
			const vInstanceofStub = sandbox.stub(vInstanceof, 'validate').resolves();
			
			return deck.create(reqStub)
				.then(() => {
					assert(vMongoIdStub.calledWithExactly(reqStub.body.creator));
					assert(vTypeofStub.calledWith(reqStub.body.name, 'string'));
					assert(vTypeofStub.calledWith(reqStub.body.description, 'string'));
					assert(vInstanceofStub.calledWithExactly(reqStub.body.cards, Array));
				});
		});

		it('call validation on all optional body keys', () => {
			const reqStub = { 
				body: {
			 		creator: validMongoId,
			 		name: 'name',
			 		description: 'description',
			 		cards: ['cards'],
			 		tags: [ 'tags' ]
				}
			}; 
			sandbox.stub(vReq, 'validate').resolves();
			const expectedReqResult = { statusCode: resCode['OK'] };
			sandbox.stub(http, 'request').callsArgWith(1, expectedReqResult);
			sandbox.stub(vMongoId, 'validate').resolves();
			sandbox.stub(vInstanceof, 'validate').resolves();
			const vTypeofStub = sandbox.stub(vTypeof, 'validate').resolves();
			const vStringArrayStub = sandbox.stub(vStringArray, 'validate').resolves();
			
			return deck.create(reqStub)
				.then(() => {
					assert(vStringArrayStub.calledWithExactly(reqStub.body.tags));
				});
		});

		it('POST /api/deckCard with all req body cards', () => {
			const reqStub = { 
				body: {
			 		creator: validMongoId,
			 		name: 'name',
			 		description: 'description',
			 		cards: ['cards']
				}
			}; 
			sandbox.stub(vReq, 'validate').resolves();
			const expectedReqResult = { statusCode: resCode['OK'] };
			const httpRequestStub = sandbox.stub(http, 'request');
			httpRequestStub.callsArgWith(1, expectedReqResult);
			sandbox.stub(vMongoId, 'validate').resolves();
			sandbox.stub(vInstanceof, 'validate').resolves();
			sandbox.stub(vTypeof, 'validate').resolves();
			sandbox.stub(vStringArray, 'validate').resolves();
			const expectedPostResult = { statusCode: resCode['OK'] };
			const options = {
				port: config.app.dbAPI.port,
				path: '/api/deckCard',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(JSON.stringify(reqStub.body.cards[0]))
				}
			};
			httpRequestStub.withArgs(options).callsArgWith(1, expectedPostResult);

			return deck.create(reqStub)
				.then(() => httpRequestStub.calledWith(options).should.be.true);
		});

		it('reject if POST /api/deckCard res statusCode is not 200 ', () => {
			const reqStub = { 
				body: {
			 		creator: validMongoId,
			 		name: 'name',
			 		description: 'description',
			 		cards: ['cards']
				}
			}; 
			sandbox.stub(vReq, 'validate').resolves();
			const expectedReqResult = { statusCode: resCode['OK'] };
			const httpRequestStub = sandbox.stub(http, 'request');
			httpRequestStub.callsArgWith(1, expectedReqResult);
			sandbox.stub(vMongoId, 'validate').resolves();
			sandbox.stub(vInstanceof, 'validate').resolves();
			sandbox.stub(vTypeof, 'validate').resolves();
			sandbox.stub(vStringArray, 'validate').resolves();
			const expectedPostResult = { statusCode: resCode['NOTFOUND'] };
			const options = {
				port: config.app.dbAPI.port,
				path: '/api/deckCard',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(JSON.stringify(reqStub.body.cards[0]))
				}
			};
			httpRequestStub.withArgs(options).callsArgWith(1, expectedPostResult);

			return deck.create(reqStub).should.be.rejectedWith(errMsg.apiServfail);
		});

		it('resolve validated data', () => {
			const reqStub = { 
				body: {
			 		creator: validMongoId,
			 		name: 'name',
			 		description: 'description',
			 		cards: ['cards'],
			 		tags: [ 'tags' ]
				}
			}; 
			sandbox.stub(vReq, 'validate').resolves();
			const expectedReqResult = { statusCode: resCode['OK'] };
			sandbox.stub(http, 'request').callsArgWith(1, expectedReqResult);
			sandbox.stub(vMongoId, 'validate').resolves();
			sandbox.stub(vInstanceof, 'validate').resolves();
			sandbox.stub(vTypeof, 'validate').resolves();
			sandbox.stub(vStringArray, 'validate').resolves();

			return deck.create(reqStub).then((data) => assert(isEqual(data, reqStub.body)));
		});

	});

	describe('#findByIdAndRemove', () => {

		it('call mongoId.validate and pass req params _id', () => {
			const reqStub = { params: { _id: validMongoId } }; 
			const vMongoIdStub = sandbox.stub(vMongoId, 'validate').resolves();
			
			return deck.findByIdAndRemove(reqStub)
				.then(() => assert(vMongoIdStub.calledWithExactly(validMongoId)));
		});

	});

});