const http = require('http');
const str = require('appStrings').dbAPI.controllers.userCardCtrl;
const config = require('config').config();
const resCode = require('config').resCode();
const errHeader = require('modules/errorHeader')(__filename);
const Query = require('dbAPI/modules/queryFactory').UserCard;
const Res = require('dbAPI/modules/resFactory');
const Validate = require('dbAPI/modules/validateFactory').UserCard;

function findAll(req, res) {
	var content = { message: errHeader + str.funcHeader.findAll };
	return Query('findAll', {}).exec()
	.then((userCards) => Res('jsonRes', res, resCode['OK'], userCards))
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
	.then((userCard) => {
		if (!userCard) {
			content.message += str.errMsg.doesNotExist;
			Res('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			if (req.method !== 'HEAD') {
				Res('jsonRes', res, resCode['OK'], userCard);
			} else {
				Res('jsonRes', res, resCode['OK'], undefined);
			}
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
	.then((newUserCard) => Res('jsonRes', res, resCode['OK'], newUserCard))
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
	.then((removedUserCard) => {
		if (removedUserCard === null) {
			content.message += str.errMsg.doesNotExist;
			Res('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			Res('jsonRes', res, resCode['OK'], removedUserCard);
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
		const conditions = { _id: req.params._id, updateData: validatedData };
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