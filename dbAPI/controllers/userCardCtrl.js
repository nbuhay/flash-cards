const http = require('http');
const str = require('appStrings').dbAPI.controllers.userCardCtrl;
const config = require('config').config();
const resCode = require('config').resCode();
const jsonRes = require('modules/jsonResponse');
const jsonReq = require('modules/jsonRequest');
const errHeader = require('modules/errorHeader')(__filename);
const UserCard = require('dbAPI/models/userCard');

function QueryFactory(type, conditions, options) {
	return {
		findAll: UserCard.find(conditions),
		findById: UserCard.findById(conditions),
		create: UserCard.create(conditions)
	}[type];
}

function ResFactory(type, res, resCode, content) {
	return {
		jsonRes: jsonRes.send(res, resCode, content)
	}[type];
}

function validateCreate(validReqBody) {
	return new Promise((resolve, reject) => {
			if (!validReqBody.hasOwnProperty('deckCard')) {
				reject({ message: str.errMsg.undefinedDeckCard });
			} else if (validReqBody.deckCard === null) {
				reject({ message: str.errMsg.nullDeckCard });
			} else {
				resolve(validReqBody.deckCard);
			}
		})
		.catch((reason) => { throw Error(reason.message); });
}

function validateDeckCardExists(validMongoId) {
	return new Promise((resolve, reject) => {
		var options = {
			port: config.app.dbAPI.port,
			path: '/api/deckCard/' + validMongoId
		};
		var req = http.request(options, (res) => {
			if (res.statusCode === resCode['OK']) {
				resolve();
			} else if (res.statusCode === resCode['NOTFOUND']) {
				reject({ message: str.errMsg.deckCardDoesNotExist });
			} else {
				reject({ message: str.errMsg.apiServfail });
			}
		});
		req.on('error', (err) => reject({ message: err }));
		req.end();
	})
	.catch((reason) => { throw Error(reason.message); });
}

function findAll(req, res) {
	return QueryFactory('findAll', {}).exec()
		.then((userCards) => ResFactory('jsonRes', res, resCode['OK'], userCards))
		.catch((reason) => {
			if (reason === undefined) {
				var content = { message: errHeader + 'findAll: ' + str.errMsg.checkQuery };
				ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
			}
		});
}

function findById(req, res) {
	var content = { message: errHeader + 'findById: ' };
	return jsonReq.validateMongoId(req.params._id)
		.then(() => QueryFactory('findById', req.params._id))
		.then((userCard) => {
			if (!userCard) {
				content.message += str.errMsg.doesNotExist;
				ResFactory('jsonRes', res, resCode['NOTFOUND'], content);
			} else {
				ResFactory('jsonRes', res, resCode['OK'], userCard);
			}
		})
		.catch((reason) => {
			if (reason === undefined) {
				content.message += str.errMsg.checkQuery;
				ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
			} else {
				content.message += reason.message;
				ResFactory('jsonRes', res, resCode['BADREQ'], content);
			}
		});
}

function create(req, res) {
	var content = { message: errHeader + 'create: ' };
	return jsonReq.validateBody(req.body)
		.then((validReqBody) => validateCreate(validReqBody))
		.then((deckCardId) => jsonReq.validateMongoId(deckCardId))
		.then(() => validateDeckCardExists(req.body.deckCard))
		.then(() => QueryFactory('create', req.body).exec())
		.then((createdUserCard) => {
			ResFactory('jsonRes', res, resCode['OK'], createdUserCard);
		})
		.catch((reason) => {
			if (reason === undefined) {
				content.message += str.errMsg.checkQuery;
				ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
			} else {
				if (reason.message === str.errMsg.apiServfail) {
					content.message += str.errMsg.apiServfail;
					ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
				} else {
					content.message += reason.message;
					ResFactory('jsonRes', res, resCode['BADREQ'], content);
				}
			}
		});
}

module.exports = {
	findAll,
	findById,
	create
};