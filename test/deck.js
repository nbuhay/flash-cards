var assert = require('assert');
var http = require('http');
var mockDecks = require('../mockData/decks').decks;
var Deck = require('../dbAPI/models/deck');

var DEFAULT_PORT = 3000;
var DEFAULT_DECK = 0;

describe('Deck Model', function () {

	describe('GET /deck/name/' + mockDecks[DEFAULT_DECK].name, () => {
		it('should return Deck deck with deck.name=' + mockDecks[DEFAULT_DECK].name, (done) => {
			var options = {
				port: DEFAULT_PORT,
				path: '/api/deck/name/' + mockDecks[DEFAULT_DECK].name
			};
			var callback = function (response) {
				var deck = '';
				response
					.on('data', (chunk) => {
						deck += chunk;
					})
					.on('end', () => {
						assert(JSON.parse(deck).name == mockDecks[DEFAULT_DECK].name);
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
				port: DEFAULT_PORT,
				path: '/api/deck/name/' + mockDecks[DEFAULT_DECK].name
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
						var DEFAULT_DECK_id = (JSON.parse(deck))._id; 
						var options = {
							port: DEFAULT_PORT,
							path: '/api/deck/_id/' + DEFAULT_DECK_id
						};
						var callback = function (response) {
							var deck = '';
							response
								.on('data', (chunk) => {
									deck += chunk;
								})
								.on('end', () => {
									assert((JSON.parse(deck))._id == DEFAULT_DECK_id);
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