const mongoose = require('mongoose');
const sinon = require('sinon');
require('sinon-as-promised');
require('sinon-mongoose');
const deckCardCtrl = require('../../../../dbAPI/controllers/deckCardCtrl');
const config = require('../../../../config').config();
const resCode = require('../../../../config').resCode();
const mockDeckCards = require('../../../../config').mockDeckCards();
const testDeckCard = require('../../../../config').testDeckCard();
const assert = require('chai').assert;
const http = require('http');
const DeckCard = require('../../../../dbAPI/models/deckCard');
const errHeader = require('../../../../modules/errorHeader')(__filename);

var sandbox;

describe('integration', () => {

	describe.skip('#findAll', () => {
		it('should return a 500 if DeckCard.find throws an exception', () => {
			return new Promise((resolve, reject) => {
				var options = {
					port: config.app.dbAPI.port,
					path: '/api/deckCard/all'
				};
				var req = http.request(options, (res) => resolve(res.statusCode));
				req.on('error', (err) => {
					reject({ message: errHeader + 'deckCardCtrl: ' + err });
				});
				req.end();
			})
			.then((statusCode) => {
				console.log(DeckCard);
				assert.equal(statusCode, resCode['NOTFOUND']);
			})
			.catch((reason) => assert(false, reason.message));
		});
	})
})