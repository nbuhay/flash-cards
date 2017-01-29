const str = require('appStrings').modules.jsonRequest;
const mongoIdRe = require('config').mongoIdRe();

function validateBody(req) {
	return new Promise((resolve, reject) => {
		if (req.headers['content-type'] === undefined) {
			reject({ message: str.errMsg.noContentType });
		} else if (req.headers['content-type'] != 'application/json') {
			 reject({ message: str.errMsg.invalidContentType + req.headers['content-type'] });
		} else if (req.body === undefined || req.body === null) {
			reject({ message: str.errMsg.invalidReqBody });
		} else {
			resolve(req.body);
		}
	})
	.catch((reason) => { throw Error(reason.message); });
}

function validateMongoId(mongoId) {
	return new Promise((resolve, reject) => {
		if (!(mongoIdRe.test(mongoId))) {
			reject({ message: str.errMsg.invalidMongoId });
		} else {
			resolve();
		}
	})
	.catch((reason) => { throw Error(reason.message); });
}

module.exports = { 
	validateBody,
	validateMongoId
};