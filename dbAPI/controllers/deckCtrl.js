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
			if (reason.message === str.errMsg.apiServfail) {
				content.message += str.errMsg.apiServfail;
				Res('jsonRes', res, resCode['SERVFAIL'], content);
			} else {
				content.message += reason.message;
				Res('jsonRes', res, resCode['BADREQ'], content);
			}
		}
	});
}

function findByIdAndRemove(req, res) {
	var content = { message: errHeader + str.funcHeader.findByIdAndRemove };
	return Validate.findByIdAndRemove(req)
	.then(() => Query('findByIdAndRemove', req.params._id).exec())
	.then((removedDeck) => {
		if (removedDeck === null) {
			content.message += str.errMsg.doesNotExist;
			Res('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			Res('jsonRes', res, resCode['OK'], removedDeck);
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

function findByIdAndUpdate() {
	return true;
}

module.exports = {
	findAll,
	findById,
	create,
	findByIdAndRemove,
	findByIdAndUpdate
}