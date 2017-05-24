const errMsg = require('appStrings').dbAPI.controllers.deckCtrl.errMsg;
const vReq = require('dbAPI/modules/validate/req');
const vMongoId = require('dbAPI/modules/validate/mongoId');

function findById(req) {
	return vMongoId.validate(req.params._id)
	.catch((reason) => { throw Error(reason.message) });
}

function create(req) {
	return vReq.validate(req)
	.then(() => {
		return new Promise((resolve, reject) => {
			(!req.body.hasOwnProperty('creator') ||
			 !req.body.hasOwnProperty('name') ||
			 !req.body.hasOwnProperty('description') ||
			 !req.body.hasOwnProperty('cards')) ?
				reject({ message: errMsg.invalidDeck }) : resolve();
		})
		.catch((reason) => { throw Error(reason.message) });
	})
	.then(() => vMongoId.validate(req.body.creator))
	.catch((reason) => { throw Error(reason.message) });
}

module.exports = {
	findById,
	create
};