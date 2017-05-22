const errMsg = require('appStrings').dbAPI.controllers.deckCardCtrl.errMsg;
const vReq = require('dbAPI/modules/validate/req');
const vMongoId = require('dbAPI/modules/validate/mongoId');
const vStringArray = require('dbAPI/modules/validate/stringArray');

function findById(req) {
	return vMongoId.validate(req.params._id)
	.catch((reason) => { throw Error(reason.message) });
}

function create(req) {
	return vReq.validate(req)
	.then(() => {
		return new Promise((resolve, reject) => {
			(!req.body.hasOwnProperty('question') || !req.body.hasOwnProperty('answer')) ?
				reject({ message: errMsg.invalidDeckCard }) : resolve();
		})
		.catch((reason) => { throw Error(reason.message) });
	})
	.then(() => vStringArray(body.answer))
	.then(() => vStringArray(body.question))
	.catch((reason) => { throw Error(reason.message); });
}

function findByIdAndRemove(req) {
	return vMongoId.validate(req.params._id)
	.catch((reason) => { throw Error(reason.message) });
}

// need to check for valid request
// resolve the updated body...
function findByIdAndUpdate(req) {
	const validators = {
		question: vStringArray.validate,
		answer: vStringArray.validate
	};
	return vReq.validate(req)
	.then(() => vMongoId.validate(req.params._id))
	.then(() => {
		return new Promise((resolve, reject) => {
			(!req.body.hasOwnProperty('question') && !req.body.hasOwnProperty('answer')) ?
				reject({ message: errMsg.invalidUpdate }) : resolve();
		})
		.catch((reason) => { throw Error(reason.message)});
	})
	.then(() => Promise.all(Object.keys(req.body).map((elem) => {
		return new Promise((resolve, reject) => {
			if (!validators[elem]) delete req.body[elem];
			resolve();
		})
	})))
	.then(() => Promise.all(Object.keys(req.body).map((elem) => {
		validators[elem](req.body[elem]);
	})))
	.then(() => { return req.body })
	.catch((reason) => { throw Error(reason.message); });
}

module.exports = {
	findById,
	create,
	findByIdAndRemove,
	findByIdAndUpdate
};