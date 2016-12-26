var CONST = require('../../global');
const resCode = require('../../global').resCode();
var mongoose = require('mongoose');
var Deck = require('../models/deck');
var jsonRes = require('../modules/jsonResponse');

module.exports.findAll = (req, res) => {
	Deck.find((err, decks) => {
		if (err) {
			console.error('Error:dbAPI:deckCtrl.findAll:' + err);
			jsonRes.send(res, resCode['SERVFAIL'], { msg: 'Error:dbAPI:deckCtrl.findAll:' + err });
		}
		jsonRes.send(res, resCode['OK'], decks);
	});
};

module.exports.save = (req, res) => {
	var deck = new Deck(req.body);
	deck.save()
		.then((resolveValue) => {
			jsonRes.send(res, resCode['OK'], resolveValue);
		})
		.then((undefined, rejectValue) => {
			jsonRes.send(res, resCode['SERVFAIL'], { msg: 'Error:dbAPI:deckCtrl.save:' + rejectValue });
		});	
};

module.exports.findOne = (req, res) => {
	Deck.findOne(
		{ name: req.params.name },
		function (err, deck) {
			if (err) console.error('Error:dbAPI:deckCtrl.findOne:' + err);
			jsonRes.send(res, resCode['OK'], deck);
		});
};

module.exports.findById = (req, res) => {
	var promise = new Promise((resolve, reject) => {
		Deck.findById(req.params._id, (err, deck) => {
			if (err) reject(err);
			resolve(deck);
		});
	})
	.then((resolveValue) => {
		jsonRes.send(res, resCode['OK'], resolveValue);
	})
	.then(undefined, (rejectValue) => {
		jsonRes.send(res, resCode['SERVFAIL'], { msg: 'Error:dbAPI:deckCtrl.findOneId:' + rejectValue});
	});
};