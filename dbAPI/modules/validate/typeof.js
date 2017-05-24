function validate(value, type) {
	return new Promise((resolve, reject) => {
		(typeof value === type) ? resolve() : reject();
	});
}

module.exports = { validate };
