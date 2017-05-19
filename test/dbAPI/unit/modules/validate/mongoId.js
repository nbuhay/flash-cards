const errMsg = require('appStrings').dbAPI.modules.mongoId.errMsg;
const vMongoId = require('dbAPI/modules/validate/mongoId');
const invalidMongoId = require('config').invalidMongoId();
const validMongoId = require('config').validMongoId();

describe('mongoId.js', () => {

	it('reject if mongoId is undefined', () => {
		return vMongoId.validate(undefined).should.be.rejectedWith(errMsg.undefinedMongoId);
	});

	it('reject if mongoId is not a valid MongoId', () => {
		return vMongoId.validate(invalidMongoId).should.be.rejectedWith(errMsg.invalidMongoId);
	});

	it('resolve if mongoId is a valid MongoId', () => {
		return vMongoId.validate(validMongoId).should.be.fulfilled;
	});

});