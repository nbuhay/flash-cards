var mongoose = require('mongoose');
var mockUsers = require('../mockData/users').users;
var User = require('../dbAPI/models/user');
var assert = require('assert');
var http = require('http');
var DEFAULT_USER = 1;
var DEFAULT_PORT = 3000;

describe('User Model', () => {

	describe('Create a new user', () => {
		it('should create a new user with the mongoose model \'User\'', () => {
			var user = new User({});
			assert(user);
		})
	})

	// arrow functions
	describe('POST /api/user', () => {
		it('should get a 200 response', (done) => {
			var options = {
				port: DEFAULT_PORT,
				path: '/api/user',
				method: 'POST'
			};
			var req = http.request(options, res => {
				assert(res.statusCode == 200);
				done();
			});
			req.write(JSON.stringify(mockUsers[DEFAULT_USER]));
			req.end();
		});
	});

	describe('GET /api/user/name/Bu', function () {
		it('should GET user object for Bu', function (done) {
			var options = {
				port: 3000,
				path: '/api/user/name/Bu'
			};
			var resStr = '';
			var callback = function (response) {
				response.on('data', function (chunk) {
					resStr += chunk;
				});
				response.on('end', function () {
					assert(JSON.parse(resStr).userName == 'Bu');
					done();
				});
			};
			http.request(options, callback).end();
		});
	});

});