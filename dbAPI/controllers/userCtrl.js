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
};