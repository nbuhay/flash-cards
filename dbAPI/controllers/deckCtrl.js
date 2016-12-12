var express = require('express');
var mongoose = require('mongoose');
var Deck = require('../models/deck');
var jsonRes = require('../modules/jsonResponse');

module.exports.findOne = function (req, res) {
	Deck.findOne(
		{ name: req.params.name },
		function (err, deck) {
			if (err) console.error('Error:dbAPI:deckCtrl.findOne:' + err);
			jsonRes.send(res, 200, deck);
		});
};

module.exports.findOneId = function (req, res) {
	Deck.findById(req.params.id, 
		function (err, deck) {
			if (err) console.error('Error:dbAPI:deckCtrl.findOneId:' + err);
			jsonRes.send(res, 200, deck);
	});
};