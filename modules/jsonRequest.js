function validateBody(req) {
	return new Promise((resolve, reject) => {
		if (req.headers['content-type'] === undefined) {
			reject({ message: 'missing header content-type' });
		} else if (req.headers['content-type'] != 'application/json') {
			var content = 'content-type should be application/json, got ' + req.headers['content-type'];
			 reject({ message: content});
		} else if (req.body === undefined || req.body === null) {
			reject({ message: 'invalid req body' });
		} else {
			resolve(req.body);
		}
	})
	.catch((reason) => { throw Error(reason.message); });
}

function validateStringArray(stringArray) {
	return new Promise((resolve, reject) => {
		if (!(Array.isArray(stringArray))) {
			reject({ message: 'invalid field: expected array, got ' + typeof stringArray });
		} else {
			for (var i = 0; i < stringArray.length; i++) {
				if (!(typeof stringArray[i] === 'string')) {
					reject({ message: 'must be an array of only strings' });
				}
			}
			resolve(stringArray);
		}
	})
	.catch((reason) => { throw Error(reason.message); });
}

module.exports = { 
	validateBody,
	validateStringArray
};