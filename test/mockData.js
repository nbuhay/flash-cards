var Deck = require('../dbAPI/models/deck');
var User = require('../dbAPI/models/user');
var mockDecks = ('../../mockData/decks').decks;
var mockUsers = ('../../mockData/users').users;
var http = require('http');
var assert = require('assert');

var DEFAULT_PORT = 3000;

describe('Mock Data', () => {

	describe('INSERT Mock Users', () => {
		it('should insert all mock user data', (done) =>{
			var options = {
				path: DEFAULT_PORT,
				path: '/api/mockData/users'
			}
			var callback = (response) => {
				var res = '';
				response
					.on('data', (chunk) => {
						res += chunk;
					})
					.on('end', () => {
						done();
					});
			};
			http.request(options, callback).end();
		});
	});

});