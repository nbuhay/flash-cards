const mongoose = require('mongoose');
const assert = require('chai').assert;
const sinon = require('sinon');
const resCode = require('config').resCode();
const jsonRes = require('dbAPI/modules/jsonResponse');
const DeckCard = require('dbAPI/models/deckCard');
const deckCardCtrl = require('dbAPI/controllers/deckCardCtrl');

var sandbox;

describe.only('deckCardCtrl.js', () => {

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('#findAll', () => {

		it('function named findAll should exist', () => {
			assert.isFunction(deckCardCtrl.findAll);
		});

		it('should call Deck.find with the empty list as the only arg', () => {
			const mockReq = { req: {} };
			const mockRes = { res: {} };
			const conditions = {};
			const jsonResStub = sandbox.stub(jsonRes);
			const mockExec = sandbox.stub().resolves();
			const deckCardStub = sandbox.stub(DeckCard, 'find').returns({ exec: mockExec });

			return deckCardCtrl.findAll(mockReq, mockRes)
				.then(() => {
					assert.equal(deckCardStub.called, true, 'should be called once');
					assert.equal(deckCardStub.calledTwice, false, 'shouldn\t be called twice');
					assert(deckCardStub.calledWith(conditions), 
						'passed args not expected');
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call jsonRes.send with a 200 when DeckCard.find resolves', () => {
			const mockReq = { req: {} };
			const mockRes = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const mockExec = sandbox.stub().resolves();
			
			sandbox.stub(DeckCard, 'find').returns({ exec: mockExec });

			return deckCardCtrl.findAll(mockReq, mockRes)
				.then(() => {
					assert.equal(jsonResStub.called, true, 'should be called once');
					assert.equal(jsonResStub.calledTwice, false, 'shouldn\t be called twice');
					assert(jsonResStub.calledWith(mockRes, resCode['OK']), 
						'passed args not expected');
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should call jsonRes.send with a 500 when DeckCard.find rejects', () => {
			const mockReq = { req: {} };
			const mockRes = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const mockExec = sandbox.stub().rejects('throwing mock exception...');
			
			sandbox.stub(DeckCard, 'find').returns({ exec: mockExec });

			return deckCardCtrl.findAll(mockReq, mockRes)
				.then(() => {
					assert.equal(jsonResStub.called, true, 'should be called once');
					assert.equal(jsonResStub.calledTwice, false, 'shouldn\t be called twice');
					assert(jsonResStub.calledWith(mockRes, resCode['SERVFAIL']), 
						'passed args not expected');
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#findById', () => {

		it('function named findById should exist', () => {
			assert.isFunction(deckCardCtrl.findAll);
		});

		it('should send a 400 if req.params._id is not a valid Mongo ObjectID', () => {
			const invalidMongoId = 'a';
			const mockReq = { 
				params: {
					_id: invalidMongoId
				} 
			};
			const mockRes = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');

			return deckCardCtrl.findById(mockReq, mockRes)
				.then(() => {
						assert.equal(jsonResStub.called, true, 'should be called once');
						assert.equal(jsonResStub.calledTwice, false, 'shouldn\'t be called twice');
						assert(jsonResStub.calledWith(mockRes, resCode['BADREQ']), 
							'passed args not expected');			
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 404 if req.params._id does\'t exist in DeckCard collection', () => {
			const idNotInCollection = 'a'.repeat(24);
			const mockReq = { 
				params: {
					_id: idNotInCollection
				} 
			};
			const mockRes = { res: {} };
			const stubCardData = null;
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const mockExec = sandbox.stub().resolves(stubCardData);
			const deckCardStub = sandbox.stub(DeckCard, 'findById').returns({ exec: mockExec });

			return deckCardCtrl.findById(mockReq, mockRes)
				.then(() => {
						assert.equal(jsonResStub.called, true, 'should be called once');
						assert.equal(jsonResStub.calledTwice, false, 'shouldn\'t be called twice');
						assert(jsonResStub.calledWith(mockRes, resCode['NOTFOUND']), 
							'passed args not expected');			
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 return if req.params._id exists in DeckCard collection', () => {
			const idInCollection = 'a'.repeat(24);
			const mockReq = { 
				params: {
					_id: idInCollection
				} 
			};
			const mockRes = { res: {} };
			const stubCardData = true;
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const mockExec = sandbox.stub().resolves(stubCardData);
			const deckCardStub = sandbox.stub(DeckCard, 'findById').returns({ exec: mockExec });

			return deckCardCtrl.findById(mockReq, mockRes)
				.then(() => {
						assert.equal(jsonResStub.called, true, 'should be called once');
						assert.equal(jsonResStub.calledTwice, false, 'shouldn\'t be called twice');
						assert(jsonResStub.calledWith(mockRes, resCode['OK']), 
							'passed args not expected');			
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 if query.exec rejects', () => {
			const idInCollection = 'a'.repeat(24);
			const mockReq = { 
				params: {
					_id: idInCollection
				} 
			};
			const mockRes = { res: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const mockExec = sandbox.stub().rejects();
			const deckCardStub = sandbox.stub(DeckCard, 'findById').returns({ exec: mockExec });

			return deckCardCtrl.findById(mockReq, mockRes)
				.then(() => {
						assert.equal(jsonResStub.called, true, 'should be called once');
						assert.equal(jsonResStub.calledTwice, false, 'shouldn\'t be called twice');
						assert(jsonResStub.calledWith(mockRes, resCode['SERVFAIL']), 
							'passed args not expected');			
				})
				.catch((reason) => assert(false, reason.message))
		});

	});

});			