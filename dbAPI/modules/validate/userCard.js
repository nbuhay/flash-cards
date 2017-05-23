const http = require('http');
const config = require('config').config();
const errMsg = require('appStrings').dbAPI.controllers.userCardCtrl.errMsg;
const vReq = require('dbAPI/modules/validate/req');
const vMongoId = require('dbAPI/modules/validate/mongoId');
const vTypeof = require('dbAPI/modules/validate/typeof');
const vInstanceof = require('dbAPI/modules/validate/instanceof');
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

function findByIdAndRemove(req) {
	return vMongoId.validate(req.params._id)
	.catch((reason) => { throw Error(reason.message) });
}

function findByIdAndUpdate(req) {
	const validators = (value) => {
		return {
			gotCorrect: vTypeof.validate(value, 'boolean'),
			lastSeen: vInstanceof.validate(value, Date),
			lastCorrect: vInstanceof.validate(value, Date),
			correctStreak: vTypeof.validate(value, 'number'),
			incorrectStreak: vTypeof.validate(value, 'number'),
			totalViews: vTypeof.validate(value, 'number')
		}
	};
	return vReq.validate(req)
	.then(() => vMongoId.validate(req.params._id))
	.then(() => {
		return new Promise((resolve, reject) => {
			(!req.body.hasOwnProperty('gotCorrect') &&
			 !req.body.hasOwnProperty('lastSeen') &&
			 !req.body.hasOwnProperty('lastCorrect') &&
			 !req.body.hasOwnProperty('correctStreak') &&
			 !req.body.hasOwnProperty('incorrectStreak') &&
			 !req.body.hasOwnProperty('totalViews')) ?
				reject({ message: errMsg.invalidUpdate }) : resolve();
		})
		.catch((reason) => { throw Error(reason.message)});
	})
	.then(() => Promise.all(Object.keys(req.body).map((elem) => {
		return new Promise((resolve, reject) => {
			if (!validators()[elem]) delete req.body[elem];
			resolve();
		});
	})))
	.then(() => Promise.all(Object.keys(req.body).map((elem) => {
		validators(req.body[elem])[elem];
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