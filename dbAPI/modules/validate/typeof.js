function validate(value, type) {
	return new Promise((resolve, reject) => {
		(typeof value === type) ? resolve() : reject('not typeof');
	})
	.catch((reason) => { throw TypeError(reason.message); });
}

module.exports = { validate };
