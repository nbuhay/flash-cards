const errMsg = require('appStrings').dbAPI.modules.mongoId.errMsg;
const mongoId = require('dbAPI/modules/validate/mongoId');
const invalidMongoId = require('config').invalidMongoId();
const validMongoId = require('config').validMongoId();
const chai = require('chai');

describe('mongoId.js', () => {

	it('should reject if mongoId is undefined', () => {
		return mongoId(undefined).should.be.rejectedWith(Error, errMsg.undefinedMongoId);
	});

	it('should reject if mongoId is not a valid MongoId', () => {
		return mongoId(invalidMongoId).should.be.rejectedWith(Error, errMsg.invalidMongoId);
	});

	it('should resolve if mongoId is a valid MongoId', () => {
		return mongoId(validMongoId).should.be.fulfilled;
	});

});