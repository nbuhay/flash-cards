const resCode = require('config').resCode();
const mongoIdRe = require('config').mongoIdRe();
const DeckCard = require('dbAPI/models/deckCard');
const jsonRes = require('dbAPI/modules/jsonResponse');
const jsonReq = require('modules/jsonRequest');
const validateStringArray = require('modules/validateStringArray');
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

function validateCreate(req, resolve, reject) {
	const jsonReqBody = validateJsonReq(req, reject);
	if (!jsonReqBody.hasOwnProperty('question') || !jsonReqBody.hasOwnProperty('answer')) {
		reject({ message: 'invalid DeckCard' });
	} else {
		validateStringArray(jsonReqBody.answer, reject);
		validateStringArray(jsonReqBody.question, reject);
	}
	resolve(jsonReqBody);
}

function validateUpdate(req, resolve, reject) {
	const jsonReqBody = validateJsonReq(req, reject);
	if (!jsonReqBody.hasOwnProperty('question') && !jsonReqBody.hasOwnProperty('answer')) {
		reject({ message: 'invalid DeckCard' });
	}else if (jsonReqBody.question && jsonReqBody.answer === undefined) {
		validateStringArray(jsonReqBody.question, reject);
	} else if (jsonReqBody.answer && jsonReqBody.question === undefined) {
		validateStringArray(jsonReqBody.answer, reject);
	} else {
		validateStringArray(jsonReqBody.answer, reject);
		validateStringArray(jsonReqBody.question, reject);
	}
	resolve(jsonReqBody);
}

function findAll(req, res) {
	var conditions = {};
	var query = QueryFactory('find', conditions);
	return query.exec()
		.then((deckCards) => {
			ResFactory('jsonRes', res, resCode['OK'], deckCards);
		})
		.catch((reason) => {
			var content = { message: errHeader + 'findAll: ' + reason.message };
			ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
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
	return new Promise((resolve, reject) => validateCreate(req, resolve, reject))
	.then((validReqBody) => DeckCard.create(validReqBody))
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
		} else {
			validateUpdate(req, resolve, reject);
		}
	})
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