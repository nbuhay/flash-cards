var assert = require('assert');
var http = require('http');
var Deck = require('../dbAPI/models/deck');

describe('Deck', function () {

	describe('GET /deck/name/Harmony', function () {
		it('Should return a Deck object with .name=Harmony', function (done) {
			var deckName = 'Harmony';
			var options = {
				port: 3000,
				path: '/api/deck/name/'+deckName
			};
			var callback = function (response) {
				var deckStr = '';
				response.on('data', function (chunk) {
					deckStr += chunk;
				});
				response.on('end', function () {
					assert(JSON.parse(deckStr).name == deckName);
					done();
				});
			}
			http.request(options, callback).end();
		})
	});
});