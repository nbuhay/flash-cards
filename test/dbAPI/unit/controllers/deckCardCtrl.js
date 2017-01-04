const sinon = require('sinon');
const deckCardCtrl = require('../../../../dbAPI/controllers/deckCardCtrl');
const assert = require('chai').assert;
const DeckCard = require('../../../../dbAPI/models/deckCard');
const mongoose = require('mongoose');

require('sinon-as-promised');
require('sinon-mongoose');

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

	});

	describe('#findById', () => {

		it('function named findById should exist', () => {
			assert.isFunction(deckCardCtrl.findAll);
		});

		it('should return a 500 if DeckCard.find throws an exception', () => {
			sandbox.stub(DeckCard, 'find', () => { throw new Error('find exception') } );
			const func = function(type) {
				return {
					find: 'inside stub',
					exception: DeckCard.find
				}[type];
			};
			sandbox.stub(deckCardCtrl, 'QueryFactory', func);

			assert.throws(deckCardCtrl.findAll , Error, 'find exception');
		});

	});

});			