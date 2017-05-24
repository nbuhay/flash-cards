function validate(value, instance) {
	return new Promise((resolve, reject) => {
		(value instanceof instance) ? resolve() : reject();
	});
}

module.exports = { validate };