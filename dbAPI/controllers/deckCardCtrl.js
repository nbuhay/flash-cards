const str = require('appStrings').dbAPI.controllers.deckCardCtrl;
const resCode = require('config').resCode();
const mongoIdRe = require('config').mongoIdRe();
const DeckCard = require('dbAPI/models/deckCard');
const jsonRes = require('modules/jsonResponse');
const jsonReq = require('modules/jsonRequest');
const errHeader = require('modules/errorHeader')(__filename);

function QueryFactory(type, conditions, options) {
	return {
		find: DeckCard.find(conditions),
		findById: DeckCard.findById(conditions),
		findByIdAndRemove: DeckCard.findByIdAndRemove(conditions),
		findByIdAndUpdate: DeckCard.findByIdAndUpdate(conditions._id, conditions.update, options)
	}[type];
}

function ResFactory(type, res, resCode, content) {
	return {
		jsonRes: jsonRes.send(res, resCode, content)
	}[type];
}

function validateStringArray(stringArray) {
	return new Promise((resolve, reject) => {
		if (!(Array.isArray(stringArray))) {
			reject({ message: 'invalid field: expected array, got ' + typeof stringArray });
		} else {
			for (var i = 0; i < stringArray.length; i++) {
				if (!(typeof stringArray[i] === 'string')) {
					reject({ message: 'must be an array of only strings' });
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
			reject({ message: 'invalid DeckCard' });
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
			reject({ message: 'invalid DeckCard' });
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
	return QueryFactory('find', {}).exec()
		.then((deckCards) => {
			ResFactory('jsonRes', res, resCode['OK'], deckCards);
		})
		.catch((reason) => {
			if (reason === undefined) {
				var content = { message: errHeader + 'findAll: ' + str.errMsg.checkQuery };
				console.log('content')
				console.log(content)
				console.log(res)
				ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
			}
		});
}

function findById(req, res) {
	return new Promise((resolve, reject) => {
		if (!mongoIdRe.test(req.params._id)) {
			reject({ message: 'req invalid param _id' });
		} else {
			resolve();
		}
	})
	.then(() => { return QueryFactory('findById', req.params._id).exec(); })
	.then((deckCard) => {
		if (!deckCard) {
			var content = { message: errHeader + 'findById: deckCard does not exist' };
			ResFactory('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			ResFactory('jsonRes', res, resCode['OK'], deckCard);			
		}
	})
	.catch((reason) => {
		if (reason === undefined) {
			var content = { message: errHeader + 'findById: undefined reason, check query' };
			ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
		} else {
			var content = { message: errHeader + 'findAll: ' + reason.message };
			ResFactory('jsonRes', res, resCode['BADREQ'], content);
		}
	});
}

function create(req, res) {
	return jsonReq.validateBody(req)
	.then((validReqBody) => validateCreate(validReqBody))
	.then((validDeckCard) => DeckCard.create(validDeckCard))
	.then((createdDeckCard) =>{
		ResFactory('jsonRes', res, resCode['OK'], createdDeckCard);
	})
	.catch((reason) => {
		if (reason === undefined) {
			var content = { message: errHeader + 'create: undefined reason, check create' };
			ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
		} else {
			var content = { message: errHeader + 'create: ' + reason.message };
			ResFactory('jsonRes', res, resCode['BADREQ'], content);
		}
	});
}

function findByIdAndRemove(req, res) {
	return new Promise((resolve, reject) => {
		if (!(mongoIdRe.test(req.params._id))) {
			reject({ message: 'req invalid param _id' });
		} else {
			resolve(req.params._id);
		}
	})
	.then((valid_id) => QueryFactory('findByIdAndRemove', valid_id).exec())
	.then((removedDeckCard) => {
		if (removedDeckCard === null) {
			var content = { message: 'DeckCard with passed _id does not exist in db' };
			ResFactory('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			ResFactory('jsonRes', res, resCode['OK'], removedDeckCard);
		}
	})
	.catch((reason) => {
		if (reason === undefined) {
			var content = { message: errHeader + 'findByIdAndRemove: undefined reason, check create' };
			ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
		} else {
			var content = { message: errHeader + 'findByIdAndRemove: ' + reason.message };
			ResFactory('jsonRes', res, resCode['BADREQ'], content);
		}
	});
}

function findByIdAndUpdate(req, res) {
	return new Promise((resolve, reject) => {
		if (!mongoIdRe.test(req.params._id)) {
			reject({ message: 'req invalid param _id' });
		}
		resolve();
	})
	.then(() => jsonReq.validateBody(req))
	.then((validReqBody) => validateUpdate(validReqBody))
	.then(() => {
		const conditions = {
			_id: req.params._id,
			update: req.body
		};
		const options = {
			new: true
		};
		return QueryFactory('findByIdAndUpdate', conditions, options).exec();
	})
	.then((updatedDeckCard) => {
		if (updatedDeckCard === null) {
			var content = { message: 'DeckCard with passed _id does not exist in db' };
			ResFactory('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			ResFactory('jsonRes', res, resCode['OK'], updatedDeckCard);
		}
	})
	.catch((reason) => {
		if (reason === undefined) {
			var content = { message: errHeader + 'findByIdAndRemove: undefined reason, check create' };
			ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
		} else {
			var content = { message: errHeader + 'findByIdAndRemove: ' + reason.message };
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