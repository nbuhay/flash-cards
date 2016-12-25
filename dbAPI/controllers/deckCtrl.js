var CONST = require('../../global');
var mongoose = require('mongoose');
var Deck = require('../models/deck');
var jsonRes = require('../modules/jsonResponse');

module.exports.findAll = (req, res) => {
	Deck.find((err, decks) => {
		if (err) {
			console.error('Error:dbAPI:deckCtrl.findAll:' + err);
			jsonRes.send(res, CONST.RES('SERVFAIL'), { msg: 'Error:dbAPI:deckCtrl.findAll:' + err });
		}
		jsonRes.send(res, CONST.RES('OK'), decks);
	});
};

module.exports.findOne = function (req, res) {
	Deck.findOne(
		{ name: req.params.name },
		function (err, deck) {
			if (err) console.error('Error:dbAPI:deckCtrl.findOne:' + err);
			jsonRes.send(res, 200, deck);
		});
};

module.exports.findById = function (req, res) {
	Deck.findById(req.params._id, (err, deck) => {
			if (err) console.error('Error:dbAPI:deckCtrl.findOneId:' + err);
			jsonRes.send(res, 200, deck);
	});
};