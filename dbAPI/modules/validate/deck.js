const errMsg = require('appStrings').dbAPI.controllers.deckCtrl.errMsg;
const vReq = require('dbAPI/modules/validate/req');
const vMongoId = require('dbAPI/modules/validate/mongoId');

function findById(req) {
	return vMongoId.validate(req.params._id)
	.catch((reason) => { throw Error(reason.message) });
}

module.exports = {
	findById
};