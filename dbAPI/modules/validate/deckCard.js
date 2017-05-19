const errMsg = require('appStrings').dbAPI.controllers.deckCardCtrl.errMsg;
const vReq = require('dbAPI/modules/validate/req');
const vMongoId = require('dbAPI/modules/validate/mongoId');
const vStringArray = require('dbAPI/modules/validate/stringArray');

function findById(mongoId) {
	return vMongoId.validate(mongoId)
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

function update(body) {
	return new Promise((resolve, reject) => {
		(!body.hasOwnProperty('question') && !body.hasOwnProperty('answer')) ?
			reject({ message: errMsg.invalidDeckCard }) : resolve();
	})
	.then(() => {
		// why is this so complicated?
		if (body.question && body.answer === undefined) {
			return vStringArray(body.question);
		} else if (body.answer && body.question === undefined) {
			return vStringArray(body.answer);
		} else {
			return vStringArray(body.answer)
				.then(vStringArray(body.question));
		}
	})
	.catch((reason) => { throw Error(reason.message); });
}

module.exports = {
	findById,
	create,
	update
};