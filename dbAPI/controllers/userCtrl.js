var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var jsonRes = require('../modules/jsonResponse');

module.exports.findOne = function (req, res) {
	User.findOne(
		{ 'userName': req.params.userName },
		function (err, user) {
			if (err) console.log("Error");
			jsonRes.send(res, 200, user);
		});
}

module.exports.newUser = (req, res) => {
	var body = [];
	req.on('data', (chunk) => {
		body.push(chunk);
	}).on('end', () => {
		// combine all array elments into single string
		var user = new User(JSON.parse(body.join()));
		user.save((err) => {
			if (err) {
				jsonRes.send(res, 500, 'Internal Server Error');
			}
			jsonRes.send(res, 200, JSON.parse(body.join()));
		});
	});
}