var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var JsonRes = require('../modules/jsonResponse');

module.exports.mockData = function (req, res) {

	mongoose.connection.db.dropCollection('users', function () {
		
		console.warn('Users dropped');

		var defaultUser = new User({
			userName: 'Bu',
			pswd: 'abc123',
			email: 'nichobu@flash.com',
			zip: 55555
		});

		defaultUser.save(function (err) {
			if (err) { 
				console.log("Error Saving defaultUser");
				res.status(500);
			} else {
				console.warn("defaultUser saved")
			}
		});
	});

	JsonRes.send(res, 200, 'db api');
};

module.exports.oneUser = function (req, res) {
	User.findOne(
		{ 'userName': req.params.userName },
		function (err, user) {
			if (err) console.log("Error");
			JsonRes.send(res, 200, user);
		});
};