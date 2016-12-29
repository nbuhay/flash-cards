const resCode = require('../../config').resCode();
var mongoose = require('mongoose');
var Deck = require('../models/deck');
var jsonRes = require('../modules/jsonResponse');
const errHeader = 'Error:dbAPI:deckCtrl.'

module.exports.findAll = (req, res) => {
	return new Promise((resolve, reject) => {
		Deck.find((err, decks) => {
			if (err) reject({ message: 'Deck.find: ' + err });
			resolve(decks);
		});
	})
	.then((decks) => res.status(resCode['OK']).json(decks))
	.catch((reason) => {
		res.status(resCode['SERVFAIL']).json({ message: errHeader + 'findAll.' + reason.message })
	});
}

module.exports.save = (req, res) => {
	var deck = new Deck(req.body);
	deck.save()
	.then((user) => {
		jsonRes.send(res, resCode['OK'], user);
	})
	.then(undefined, (reason) => {
		jsonRes.send(res, resCode['SERVFAIL'], { msg: 'Error:dbAPI:deckCtrl.save:' + reason });
	});	
}

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
		jsonRes.send(res, resCode['SERVFAIL'], { msg: 'Error:dbAPI:deckCtrl.findOneId:' + rejectValue });
	});
};

module.exports.findByIdAndUpdate = (req, res) => {
	// options params.req._id
	// findByIdAndUpdate, passing options and req body
	// see what it returns, promise probability
	var promise = new Promise((resolve, reject) => {
		var options = {
			new: true
		};
		var updatedDeck = req.body;
		delete updatedDeck._id;
		Deck.findByIdAndUpdate(req.params._id, updatedDeck, options, (err, deck) => {
			if (err) reject('findByIdAndUpdate:' + err);
			resolve(deck);
		});
	})
	.then((resolveValue) => {
		jsonRes.send(res, resCode['OK'], resolveValue);
	})
	.then(undefined, (rejectValue) => {
		jsonRes.send(res, resCode['SERVFAIL'], { message: 'error:dbAPI:deckCtrl.' + rejectValue });
	});
};

module.exports.findOneAndRemove = (req, res) => {
	var promise = new Promise((resolve, reject) => {
		var options = {
			_id: req.params._id
		};
		Deck.findOneAndRemove(options, (err, user) => {
			if (err) {
				reject('findOneAndRemove:%s', err);
			}
			resolve('findOneAndRemove:success:%s', user);
		});
	})
	.then((resolveValue) => {
		jsonRes.send(res, resCode['OK'], resolveValue);
	})
	.then(undefined, (rejectValue) => {
		jsonRes.send(res, resCode['SERVFAIL'], rejectValue);
	});
};