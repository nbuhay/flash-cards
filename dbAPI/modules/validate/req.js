const errMsg = require('appStrings').dbAPI.modules.req.errMsg;

function validate(req) {
	return new Promise((resolve, reject) => {
		if (req.headers['content-type'] === undefined) {
			reject({ message: errMsg.noContentType });
		} else if (req.headers['content-type'] != 'application/json') {
			reject({ message: errMsg.invalidContentType + req.headers['content-type'] });
		} else if (req.body === undefined || req.body === null) {
			reject({ message: errMsg.invalidReqBody });
		} else {
			resolve();
		}
	})
	.catch((reason) => { throw Error(reason.message); });
}

module.exports = { validate };