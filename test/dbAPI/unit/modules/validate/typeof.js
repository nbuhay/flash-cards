const errMsg = require('appStrings').dbAPI.modules.typeof.errMsg;
const vTypeof = require('dbAPI/modules/validate/typeof');

describe('typeof.js', () => {

	it('rejects 42 typeof boolean', () => 
		vTypeof.validate(42, 'boolean').should.be.rejected);

	it('resolves  42 typeof number', () => 
		vTypeof.validate(42, 'number').should.be.fulfilled);

	it('rejects with msg');

});