const mongoose = require('mongoose');
const sinon = require('sinon');
require('sinon-as-promised');

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;

const jsonRes = require('../../../../dbAPI/modules/jsonResponse');
const resCode = require('../../../../config').resCode();
const DeckCard = require('../../../../dbAPI/models/deckCard');

const deckCardCtrl = require('../../../../dbAPI/controllers/deckCardCtrl');


var sandbox;

describe('deckCardCtrl.js', () => {

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

		it.only('should call jsonRes when DeckCard.find resolves', () => {
			const mockReq = { req: {} };
			const mockRes = { res: {} };
			const mockExec = sandbox.stub().rejects('throwing mock exception...');
			
			// sandbox.stub(DeckCard, 'find').returns({ exec: mockExec });
			// const QueryFactoryStub = (type) => {
			// 	return {
			// 		find: DeckCard.find
			// 	}[type];
			// };
			// sandbox.stub(deckCardCtrl, 'QueryFactory', QueryFactoryStub);
			// const ResFactoryStub = (type, res, resCode, content) => {
			// 	return {
			// 		jsonRes: jsonResStub(resCode)
			// 	}[type];
			// };
			// sandbox.stub(deckCardCtrl, 'ResFactory', ResFactoryStub);

			// const jsonResStub = (res, resCode, content) => {
			// 	return resCode
			// };
			const jsonResStub = 
				sandbox.stub(jsonRes, 'send', () => { console.log('okay in jsonRes') });
			// requireSubvert.subvert('../../../../dbAPI/modules/jsonResponse', jsonResStub);
			// bar = requireSubvert.require('../../../../dbAPI/controllers/deckCardCtrl');
			// console.log(bar.ResFactory('jsonRes', undefined, 3434343, undefined));
			// console.log(bar.ResFactory('jsonRes', undefined, 'this freaking works.', undefined));
			const ResFactoryStub = (type, res, resCode, content) => {
				return {
					jsonRes: mockJsonRes()
				}[type];
			};

			sandbox.stub(DeckCard, 'find').returns({
				exec: mockExec
			});
			const queryFactoryStub = (type) => {
				return {
					find: DeckCard.find,
				}[type];
			};

			// sandbox.stub(jsonRes, 'send', ResFactoryStub);
			// console.log(jsonRes.send(undefined, 43232, undefined));
			// sandbox.stub(deckCardCtrl, 'ResFactory', ResFactoryStub);
			// console.log(deckCardCtrl);
			// console.log('right after stub: ' + deckCardCtrl.ResFactory(undefined, 400, undefined));
			// assert(deckCardCtrl.findAll(mockReq, mockRes), resCode['SERVFAIL']);

			sandbox.stub(deckCardCtrl, 'QueryFactory', queryFactoryStub);

			return deckCardCtrl.findAll(mockReq, mockRes)
				.then(() => {
					// console.log(jsonResStub.calledTwice);
					// console.log(jsonResStub)
					assert.equal(jsonResStub.called, true, 'should be called once');
					assert.equal(jsonResStub.calledTwice, false, 'shouldn\t be called twice');
					assert(jsonResStub.calledWith(mockRes, resCode['SERVFAIL']), 
						'passed args not expected');
					// requireSubvert.cleanUp();
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