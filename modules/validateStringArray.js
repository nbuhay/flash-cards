function validateStringArray(stringArray, reject) {
	if (!(Array.isArray(stringArray))) {
		reject({ message: 'invalid field, expected [\'string\']'});
	} else {
		for (var i = 0; i < stringArray.length; i++) {
			if (!(typeof stringArray[i] === 'string')) {
				reject({ message: 'must be an array of only strings'});
			}
		}
	}
}

module.exports = validateStringArray;