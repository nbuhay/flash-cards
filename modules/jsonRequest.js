function validate(req) {
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

module.exports = { validate };