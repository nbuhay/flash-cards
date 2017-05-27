const errMsg = require('appStrings').dbAPI.controllers.deckCtrl.errMsg;
const http = require('http');
const config = require('config').config();
const resCode = require('config').resCode();
const vReq = require('dbAPI/modules/validate/req');
const vMongoId = require('dbAPI/modules/validate/mongoId');
const vTypeof = require('dbAPI/modules/validate/typeof');
const vInstanceof = require('dbAPI/modules/validate/instanceof');
const vStringArray = require('dbAPI/modules/validate/stringArray');
const validators = (value) => {
	return {
		required: {
			creator: () => vMongoId.validate(value),
			name: () => vTypeof.validate(value, 'string'),
			description: () => vTypeof.validate(value, 'string'),
			cards: () => vInstanceof.validate(value, Array)
		},
		optional: {
			learning: () => vTypeof.validate(value, 'number'),
			tags: () => vStringArray.validate(value)
		}
	}
};

function findById(req) {
	return vMongoId.validate(req.params._id)
	.catch((reason) => { throw Error(reason.message) });
}

function create(req) {
	return vReq.validate(req)
	.then(() => {
		return new Promise((resolve, reject) => {
			for (requiredKey in validators().required) {
				if (!req.body.hasOwnProperty(requiredKey)) reject({ message: errMsg.invalidDeck });
			}
			resolve();
		})
		.catch((reason) => { throw Error(reason.message) });
	})
	.then(() => {
		return new Promise((resolve, reject) => {
			var options = {
				port: config.app.dbAPI.port,
				path: '/api/user/' + req.body.creator,
				method: 'HEAD'
			};
			var request = http.request(options, (res) => {
				if (res.statusCode === resCode['OK']) {
					resolve();
				} else if (res.statusCode === resCode['NOTFOUND']) {
					reject({ message: errMsg.userDNE });
				} else {
					reject({ message: errMsg.apiServfail });
				}
			});
			request.on('error', (err) => reject({ message: err }));
			request.end();
		})
		.catch((reason) => { throw Error(reason.message); });
	})
	.then(() => Promise.all(Object.keys(req.body).map((elem) => {
		return new Promise((resolve, reject) => {
			if (!validators().required[elem] && !validators().optional[elem]) delete req.body[elem];
			resolve();
		});
	})))
	.then(() => Promise.all(Object.keys(validators().required).map((elem) => {
		validators(req.body[elem]).required[elem]();
	})))
	.then(() => Promise.all(Object.keys(validators().optional).map((elem) => {
		if (req.body.hasOwnProperty(elem)) validators(req.body[elem]).optional[elem]();
	})))
	.then(() => { return req.body })
	.catch((reason) => { throw Error(reason.message) });
}

module.exports = {
	findById,
	create
};