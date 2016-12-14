var mongoose = require('mongoose');
var User = require('../dbAPI/models/user');
var assert = require('assert');
var http = require('http');

describe('User', function () {

	describe('user = new User({})', function () {
		it('should create a new user', function () {
			var user = new User({});
			assert(user);
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