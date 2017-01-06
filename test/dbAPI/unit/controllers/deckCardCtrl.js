const mongoose = require('mongoose');
const assert = require('chai').assert;
const sinon = require('sinon');
const resCode = require('config').resCode();
const jsonRes = require('dbAPI/modules/jsonResponse');
const DeckCard = require('dbAPI/models/deckCard');
const deckCardCtrl = require('dbAPI/controllers/deckCardCtrl');

var sandbox;

describe('deckCardCtrl.js', () => {

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe.only('#findAll', () => {

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

		it('should send a 500 if DeckCard.find throws an exception', () => {
			const mockReq = {};
			const mockRes = {};
			const mockExec = sinon.stub().rejects(new Error('exec rejected'));
			sandbox.stub(DeckCard, 'find').returns({
				exec: mockExec
			});
			const queryFactoryStub = (type) => {
				return {
					find: 'inside stub',
					exception: DeckCard.find
				}[type];
			};
			const jsonResStub = (res, resCode, content) => {
				return resCode;
			};

			sandbox.stub(deckCardCtrl, 'QueryFactory', queryFactoryStub);
			sandbox.stub(jsonRes, 'send', jsonResStub);

			assert.eventually.equal(deckCardCtrl.findAll({}, {}), resCode['SERVFAIL']);
			
		});

	});

});			