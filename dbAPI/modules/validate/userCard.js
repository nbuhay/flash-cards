const http = require('http');
const config = require('config').config();
const errMsg = require('appStrings').dbAPI.controllers.userCardCtrl.errMsg;
const vReq = require('dbAPI/modules/validate/req');
const vMongoId = require('dbAPI/modules/validate/mongoId');
const resCode = require('config').resCode();

function findById(req) {
	return vMongoId.validate(req.params._id)
	.catch((reason) => { throw Error(reason.message) });
}

function create(req) {
	return vReq.validate(req)
	.then(() => {
		return new Promise((resolve, reject) => {
			(!req.body.hasOwnProperty('deckCard')) ?
				reject({ message: errMsg.undefinedDeckCard }) : resolve();
		})
		.catch((reason) => { throw Error(reason.message) });
	})
	.then(() => vMongoId.validate(req.body.deckCard))
	.then(() => {
		return new Promise((resolve, reject) => {
			var options = {
				port: config.app.dbAPI.port,
				path: '/api/deckCard/' + req.body.deckCard,
				method: 'HEAD'
			};
			var request = http.request(options, (res) => {
				if (res.statusCode === resCode['OK']) {
					var validatedData = { deckCard: req.body.deckCard };
					resolve(validatedData);
				} else if (res.statusCode === resCode['NOTFOUND']) {
					reject({ message: errMsg.deckCardDoesNotExist });
				} else {
					reject({ message: errMsg.apiServfail });
				}
			});
			request.on('error', (err) => reject({ message: err }));
			request.end();
		})
		.catch((reason) => { throw Error(reason.message); });
	})
	.catch((reason) => { throw Error(reason.message) });
}

module.exports = {
	findById,
	create
};