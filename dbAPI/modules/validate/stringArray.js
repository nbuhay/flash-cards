const errMsg = require('appStrings').dbAPI.modules.stringArray.errMsg;

function validate(stringArray) {
	return new Promise((resolve, reject) => {
		if (!(Array.isArray(stringArray))) {
			reject({ message: errMsg.invalidArrayField + typeof stringArray });
		} else {
			for (var i = 0; i < stringArray.length; i++) {
				if (!(typeof stringArray[i] === 'string')) {
					reject({ message: errMsg.invalidStringArray });
				}
			}
			resolve();
		}
	})
	.catch((reason) => { throw Error(reason.message); });
};

module.exports = { validate };