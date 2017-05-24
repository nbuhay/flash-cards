const errMsg = require('appStrings').dbAPI.modules.instanceof.errMsg;
const vInstanceof = require('dbAPI/modules/validate/instanceof');

describe('instanceof.js', () => {

	it('rejects new Date instanceof String', () => 
		vInstanceof.validate(new Date(), String).should.be.rejected);

	it('resolves new Date instanceof Object', () => 
		vInstanceof.validate(new Date(), Object).should.be.fulfilled);

});