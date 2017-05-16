const str = require('appStrings').dbAPI.controllers.deckCardCtrl;
const resCode = require('config').resCode();
const jsonReq = require('modules/jsonRequest');
const errHeader = require('modules/errorHeader')(__filename);
const DeckCardQuery = require('dbAPI/modules/queryFactory').DeckCard;
const ResFactory = require('dbAPI/modules/resFactory');

function validateStringArray(stringArray) {
	return new Promise((resolve, reject) => {
		if (!(Array.isArray(stringArray))) {
			reject({ message: str.errMsg.invalidArrayField + typeof stringArray });
		} else {
			for (var i = 0; i < stringArray.length; i++) {
				if (!(typeof stringArray[i] === 'string')) {
					reject({ message: str.errMsg.invalidStringArray });
				}
			}
			resolve();
		}
	})
	.catch((reason) => { throw Error(reason.message); });
}

function validateCreate(validReqBody) {
	return new Promise((resolve, reject) => {
		if (!validReqBody.hasOwnProperty('question') || !validReqBody.hasOwnProperty('answer')) {
			reject({ message: str.errMsg.invalidDeckCard });
		}
		resolve();
	})
	.then(() => validateStringArray(validReqBody.answer))
	.then(() => validateStringArray(validReqBody.question))
	.then(() => { return validReqBody; })
	.catch((reason) => { throw Error(reason.message); });
}

function validateUpdate(validReqBody) {
	return new Promise((resolve, reject) => {
		if (!validReqBody.hasOwnProperty('question') && !validReqBody.hasOwnProperty('answer')) {
			reject({ message: str.errMsg.invalidDeckCard });
		} 
		resolve();
	})
	.then(() => {
		if (validReqBody.question && validReqBody.answer === undefined) {
			return validateStringArray(validReqBody.question);
		} else if (validReqBody.answer && validReqBody.question === undefined) {
			return validateStringArray(validReqBody.answer);
		} else {
			return validateStringArray(validReqBody.answer)
				.then(validateStringArray(validReqBody.question));
		}
	})
	.catch((reason) => { throw Error(reason.message); });
}

function findAll(req, res) {
	const conditions = {};
	return DeckCardQuery('find', conditions).exec()
		.then((deckCards) => ResFactory('jsonRes', res, resCode['OK'], deckCards))
		.catch((reason) => {
			if (reason === undefined) {
				var content = { message: errHeader + 'findAll: ' + str.errMsg.checkQuery };
				ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
			}
		});
}

function findById(req, res) {
	return jsonReq.validateMongoId(req.params._id)
	.then(() => DeckCardQuery('findById', req.params._id).exec())
	.then((deckCard) => {
		if (!deckCard) {
			var content = { message: errHeader + 'findById: ' + str.errMsg.doesNotExist };
			ResFactory('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			ResFactory('jsonRes', res, resCode['OK'], deckCard);			
		}
	})
	.catch((reason) => {
		if (reason === undefined) {
			var content = { message: errHeader + 'findById: ' + str.errMsg.checkQuery };
			ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
		} else {
			var content = { message: errHeader + 'findById: ' + reason.message };
			ResFactory('jsonRes', res, resCode['BADREQ'], content);
		}
	});
}

function create(req, res) {
	var content =  { message: errHeader + 'create: ' };
	return jsonReq.validateBody(req)
	.then((validReqBody) => validateCreate(validReqBody))
	.then((validDeckCard) => DeckCard.create(validDeckCard))
	.then((createdDeckCard) => ResFactory('jsonRes', res, resCode['OK'], createdDeckCard))
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

function findByIdAndRemove(req, res) {
	var content = { message: errHeader + 'findByIdAndRemove: ' };
	return jsonReq.validateMongoId(req.params._id)
		.then(() => DeckCardQuery('findByIdAndRemove', req.params._id).exec())
		.then((removedDeckCard) => {
			if (removedDeckCard === null) {
				content.message += str.errMsg.doesNotExist;
				ResFactory('jsonRes', res, resCode['NOTFOUND'], content);
			} else {
				ResFactory('jsonRes', res, resCode['OK'], removedDeckCard);
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

function findByIdAndUpdate(req, res) {
	var content = { message: errHeader + str.funcHeader.findByIdAndUpdate };
	return jsonReq.validateMongoId(req.params._id)
		.then(() => jsonReq.validateBody(req))
		.then(() => validateUpdate(req.body))
		.then(() => {
			const conditions = {
				_id: req.params._id,
				update: req.body
			};
			const options = {
				new: true
			};
			return DeckCardQuery('findByIdAndUpdate', conditions, options).exec();
		})
		.then((updatedDeckCard) => {
			if (updatedDeckCard === null) {
				content.message += str.errMsg.doesNotExist;
				ResFactory('jsonRes', res, resCode['NOTFOUND'], content);
			} else {
				ResFactory('jsonRes', res, resCode['OK'], updatedDeckCard);
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

module.exports = {
	findAll,
	findById,
	create,
	findByIdAndRemove,
	findByIdAndUpdate
};