var http = require('http');
var assert = require('assert');
var CONST = require('../global');
var mockDecks = ('../../mockData/decks').decks;
var mockUsers = ('../../mockData/users').users;
var Deck = require('../dbAPI/models/deck');
var User = require('../dbAPI/models/user');

describe('Mock Data', () => {

	describe('INSERT Users', () => {
		it('should insert all mock user data', (done) =>{
			var options = {
				port: CONST.PORT(),
				path: '/api/mockData/users'
			}
			var callback = (response) => {
				var res = '';
				response
					.on('data', (chunk) => {
						res += chunk;
					})
					.on('end', () => {
						assert(response.statusCode == CONST.RES('OK'));
						done();
					});
			};
			http.request(options, callback).end();
		});
	});

	describe('INSERT Decks', () => {
		it('should insert all mock deck data', (done) => {
			var options = {
				port: CONST.PORT(),
				path: '/api/mockData/decks'
			};
			var callback = (response) => {
				var res = '';
				response
					.on('data', (chunk) => {
						res += chunk;
					})
					.on('end', () => {
						assert(response.statusCode == CONST.RES('OK'));
						done();
					});
			};
			http.request(options, callback).end();
		});
	});

});