const errMsg = require('appStrings').dbAPI.modules.stringArray.errMsg;
const vStringArray = require('dbAPI/modules/validate/stringArray');

describe('stringArray.js', () => {

	it('reject if not an array', () => {
		const notArray = 'true';
		return vStringArray.validate(notArray)
			.should.be.rejectedWith(Error, errMsg.invalidArrayField + typeof notArray);
	});

	it('reject if not an array of only strings', () => {
		const notStringArray = [ 42 ];
		return vStringArray.validate(notStringArray)
			.should.be.rejectedWith(Error, errMsg.invalidStringArray);
	});

});