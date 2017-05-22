const http = require('http');
const str = require('appStrings').dbAPI.controllers.userCardCtrl;
const config = require('config').config();
const resCode = require('config').resCode();
const errHeader = require('modules/errorHeader')(__filename);
const Query = require('dbAPI/modules/queryFactory').UserCard;
const Res = require('dbAPI/modules/resFactory');
const Validate = require('dbAPI/modules/validateFactory').UserCard;

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

function validateFindByIdAndUpdate(validReqBody) {
	var content = { message: str.funcHeader.validateFindByIdAndUpdate };
	return jsonReq.validateMongoId(validReqBody.deckCard)
		.then(() => validateDeckCardExists(validReqBody.deckCard))
		.then(() => {
			return new Promise((resolve, reject) => {
				if (validReqBody.gotCorrect === undefined || typeof validReqBody.gotCorrect !== 'boolean') {
					validReqBody.gotCorrect = false;
				}
				if (validReqBody.lastSeen === undefined || !(validReqBody.lastSeen instanceof Date)
					|| isNaN(validReqBody.lastSeen.valueOf())) {
					validReqBody.lastSeen = new Date();
				}
				if (validReqBody.lastCorrect === undefined || !(validReqBody.lastCorrect instanceof Date)
					|| isNaN(validReqBody.lastCorrect.valueOf())) {
					validReqBody.lastCorrect = new Date();
				}
				if (validReqBody.correctStreak === undefined || typeof correctStreak !== 'number') {
					validReqBody.correctStreak = 0;
				}
				if (validReqBody.incorrectStreak === undefined || typeof incorrectStreak !== 'number') {
					validReqBody.incorrectStreak = 0;
				}
				if (validReqBody.totalViews === undefined || typeof totalViews !== 'number') {
					validReqBody.totalViews = 0;
				}
				const updateData = {
					gotCorrect: validReqBody.gotCorrect,
					lastSeen: validReqBody.lastSeen,
					lastCorrect: validReqBody.lastCorrect,
					correctStreak: validReqBody.correctStreak,
					incorrectStreak: validReqBody.incorrectStreak,
					totalViews: validReqBody.totalViews
				}
				resolve(updateData);
			})
			.catch((rejectValue) => { throw Error(); });
		}) 
		.catch((reason) => { throw Error(content.message + reason.message); });
}

function validateDeckCardExists(validMongoId) {
	return new Promise((resolve, reject) => {
		var options = {
			port: config.app.dbAPI.port,
			path: '/api/deckCard/' + validMongoId,
			method: 'HEAD'
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
	var content = { message: errHeader + 'create: ' };
	return jsonReq.validateBody(req.body)
		.then(() => validateCreate(req.body))
		.then((deckCardId) => jsonReq.validateMongoId(deckCardId))
		.then(() => validateDeckCardExists(req.body.deckCard))
		.then(() => Query('create', req.body).exec())
		.then((createdUserCard) => {
			Res('jsonRes', res, resCode['OK'], createdUserCard);
		})
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

function findByIdAndUpdate(req, res) {
	var content = { message: errHeader + str.funcHeader.findByIdAndUpdate };
	return jsonReq.validateMongoId(req.params._id)
		.then(() => jsonReq.validateBody(req.body))
		.then(() => validateFindByIdAndUpdate(req.body))
		.then((updateData) => {
			const conditions = {
				_id: req.params._id,
				updateData: updateData
			};
			return Query('findByIdAndUpdate', conditions).exec();
		})
		.then(() => Res('jsonRes', res, resCode['OK']))
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
	findByIdAndUpdate
};