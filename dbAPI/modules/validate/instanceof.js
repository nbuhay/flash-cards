function validate(value, instance) {
	return new Promise((resolve, reject) => {
		(value instanceof instance) ? resolve() : reject('not instanceof');
	})
	.catch((reason) => { throw Error(reason.message) });
}

module.exports = { validate };