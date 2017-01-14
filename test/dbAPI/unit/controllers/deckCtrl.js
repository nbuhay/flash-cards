const mongoose = require('mongoose');
const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');
require('sinon-as-promised');
const resCode = require('config').resCode();
const jsonRes = require('modules/jsonResponse');
const Deck = require('dbAPI/models/deck');
const deckCtrl = require('dbAPI/controllers/deckCtrl');

var sandbox;

describe('deckCtrl.js', () => {

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('#findAll', () => {

		it('function named findAll should exist', () => {
			expect(deckCtrl.findAll).to.exist;
		});

		it('should call Deck.find with \'conditions\' equal to a empty object', () => {
			const conditions = {};
			const resDummy = { res: {} };
			const reqDummy = { req: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().resolves();
			const deckStub = sandbox.stub(Deck, 'find', () => { return { exec: execStub } });

			return deckCtrl.findAll(resDummy, reqDummy)
				.then(() => {
					expect(deckStub.calledOnce, 'calledOnce').to.be.true;
					expect(deckStub.calledWithExactly(conditions), 'calledWithExactly').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 500 when Deck.find rejects', () => {
			const conditions = {};
			const resDummy = { res: {} };
			const reqDummy = { req: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().rejects();
			const deckStub = sandbox.stub(Deck, 'find', () => { return { exec: execStub } });

			return deckCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					expect(deckStub.calledOnce, 'deck calledOnce').to.be.true;
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.
						calledWithMatch(resDummy, resCode['SERVFAIL']),'calledWithMatch').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

		it('should send a 200 when Deck.find resolves', () => {
			const conditions = {};
			const resDummy = { res: {} };
			const reqDummy = { req: {} };
			const jsonResStub = sandbox.stub(jsonRes, 'send');
			const execStub = sandbox.stub().resolves();
			const deckStub = sandbox.stub(Deck, 'find', () => { return { exec: execStub } });

			return deckCtrl.findAll(reqDummy, resDummy)
				.then(() => {
					expect(deckStub.calledOnce, 'deck calledOnce').to.be.true;
					expect(jsonResStub.calledOnce, 'jsonRes calledOnce').to.be.true;
					expect(jsonResStub.
						calledWithMatch(resDummy, resCode['OK']),'calledWithMatch').to.be.true;
				})
				.catch((reason) => assert(false, reason.message));
		});

	});

	describe('#create', () => {

		// need unit tests for validate functions first
		// then write these unit tests to ensure it calls the validate functions

	});
	// describe('#create');
	// describe('#findById');
	// describe('#findByIdAndUpdate');
	// describe('#findByIdAndRemove');

});