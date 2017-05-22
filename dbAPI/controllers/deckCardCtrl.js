const str = require('appStrings').dbAPI.controllers.deckCardCtrl;
const resCode = require('config').resCode();
const errHeader = require('modules/errorHeader')(__filename);
const Res = require('dbAPI/modules/resFactory');
const Query = require('dbAPI/modules/queryFactory').DeckCard;
const Validate = require('dbAPI/modules/validateFactory').DeckCard;

function findAll(req, res) {
	var content = { message: errHeader + str.funcHeader.findAll };
	const conditions = {};
	return Query('find', conditions).exec()
	.then((deckCards) => Res('jsonRes', res, resCode['OK'], deckCards))
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
	.then((deckCard) => {
		if (!deckCard) {
			content.message += str.errMsg.doesNotExist;
			Res('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			Res('jsonRes', res, resCode['OK'], deckCard);			
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
	var content =  { message: errHeader + str.funcHeader.create };
	return Validate.create(req)
	.then(() => Query('create', req.body).exec())
	.then((deckCard) => Res('jsonRes', res, resCode['OK'], deckCard))
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

function findByIdAndRemove(req, res) {
	var content = { message: errHeader + str.funcHeader.findByIdAndRemove };
	return Validate.findByIdAndRemove(req)
	.then(() => Query('findByIdAndRemove', req.params._id).exec())
	.then((removedDeckCard) => {
		if (removedDeckCard === null) {
			content.message += str.errMsg.doesNotExist;
			Res('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			Res('jsonRes', res, resCode['OK'], removedDeckCard);
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

function findByIdAndUpdate(req, res) {
	var content = { message: errHeader + str.funcHeader.findByIdAndUpdate };
	return Validate.findByIdAndUpdate(req)
	.then((validatedData) => {
		const conditions = { _id: req.params._id, update: validatedData };
		const options = { new: true };
		return Query('findByIdAndUpdate', conditions, options).exec();
	})
	.then((updatedDeckCard) => {
		if (updatedDeckCard === null) {
			content.message += str.errMsg.doesNotExist;
			Res('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			Res('jsonRes', res, resCode['OK'], updatedDeckCard);
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

module.exports = {
	findAll,
	findById,
	create,
	findByIdAndRemove,
	findByIdAndUpdate
};