const str = require('appStrings').dbAPI.controllers.deckCtrl;
const resCode = require('config').resCode();
const config = require('config').config();
const mongoIdRe = require('config').mongoIdRe();
const Deck = require('dbAPI/models/deck');
const http = require('http');
const jsonReq = require('modules/jsonRequest');
const errHeader = require('modules/errorHeader')(__filename);
const Query = require('dbAPI/modules/queryFactory').Deck;
const Res = require('dbAPI/modules/resFactory');
const Validate = require('dbAPI/modules/validateFactory').Deck;

function findAll(req, res) {
	var content = { message: errHeader + str.funcHeader.findAll };
	const conditions = {};
	return Query('find', conditions).exec()
	.then((decks) => Res('jsonRes', res, resCode['OK'], decks))
	.catch((reason) => {
		if (reason === undefined) {
			content.message += str.errMsg.checkQuery;
			Res('jsonRes', res, resCode['SERVFAIL'], content);
		}
	});
}

function findById(req, res) {
	var content = { message: errHeader + str.funcHeader.findById };
	return Validate.findById(req)
	.then(() => Query('findById', req.params._id).exec())
	.then((deck) => {
		if (!deck) {
			content.message += str.errMsg.doesNotExist;
			Res('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			Res('jsonRes', res, resCode['OK'], deck);			
		}
	})
	.catch((reason) => {
		if (reason === undefined) {
			content.message += str.errMsg.checkQuery;
			Res('jsonRes', res, resCode['SERVFAIL'], content);
		} else {
			content.message += reason.message;
			Res('jsonRes', res, resCode['BADREQ'], content);
		}
	});
}

function create(req, res) {
	var content = { message: errHeader + str.funcHeader.create };
	return Validate.create(req)
	.then((validatedData) => Query('create', validatedData)().exec())
	.then((deck) => Res('jsonRes', res, resCode['OK'], deck))
	.catch((reason) => {
		if (reason === undefined) {
			content.message += str.errMsg.checkQuery;
			Res('jsonRes', res, resCode['SERVFAIL'], content);
		} else {
			content.message += reason.message;
			Res('jsonRes', res, resCode['BADREQ'], content);
		}
	});
}

function findOneAndRemove(req, res) {
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
}

function findByIdAndUpdate(req, res) {
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
}

module.exports = {
	findAll,
	findById,
	create,
	findOneAndRemove,
	findByIdAndUpdate
}