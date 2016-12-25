var CONST = require('../global');
var assert = require('assert');
var http = require('http');
var mockDecks = require('../mockData/decks').decks;
var Deck = require('../dbAPI/models/deck');

describe('Deck Model', () => {

	describe('GET /api/decks', () => {
		it('should return all Deck objects', (done) => {
			var options = {
				port: CONST.PORT(),
				path: '/api/decks'
			};
			var callback = (response) => {
				var decks = '';
				response
					.on('data', (chunk) => {
						decks += chunk;
					})
					.on('end', () => {
						assert(response.statusCode == CONST.RES('OK'));
						done();
					});
			};
			var req = http.request(options, callback);
			req
				.on('error', (e) => {
					assert(true == false);
					done();
				});
			req.end();
			// promise
			// var promise = new Promise()
		});
	});

	describe('GET /deck/name/' + mockDecks[CONST.TEST_DECK()].name, () => {
		it('should return Deck deck with deck.name=' + mockDecks[CONST.TEST_DECK()].name, (done) => {
			var options = {
				port: CONST.PORT(),
				path: '/api/deck/name/' + mockDecks[CONST.TEST_DECK()].name
			};
			var callback = function (response) {
				var deck = '';
				response
					.on('data', (chunk) => {
						deck += chunk;
					})
					.on('end', () => {
						assert(JSON.parse(deck).name == mockDecks[CONST.TEST_DECK()].name);
						done();
					});
			}
			http.request(options, callback).end();
		});
	});

	describe('GET /api/deck/_id/:_id', () => {
		it('should GET Deck deck with deck._id == req.params._id', (done) => {
			// need to GET by name first, inserted in test above
			var options = {
				port: CONST.PORT(),
				path: '/api/deck/name/' + mockDecks[CONST.TEST_DECK()].name
			};
			var callback = function (response) {
				var deck = '';
				response
					.on('data', (chunk) => {
						deck += chunk;
					});
				response
					.on('end', function () {
						// got deck by name, now get by _id
						// store the deck._id
						var deckWith_id = (JSON.parse(deck)); 
						var options = {
							port: CONST.PORT(),
							path: '/api/deck/_id/' + deckWith_id._id
						};
						var callback = function (response) {
							var deck = '';
							response
								.on('data', (chunk) => {
									deck += chunk;
								})
								.on('end', () => {
									assert((JSON.parse(deck))._id == deckWith_id._id);
									done();
								});
						};
						http.request(options, callback).end();
					});
			};
			http.request(options, callback).end();
		});
	});

});