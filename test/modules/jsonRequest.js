const str = require('appStrings').modules.jsonRequest;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const jsonReq = require('modules/jsonRequest');
const invalidMongoId = require('config').invalidMongoId();
const validMongoId = require('config').validMongoId();
chai.use(chaiAsPromised);
const expect = chai.expect;
chai.should();

describe('jsonRequest.js', () => {

	describe('#validateBody', () => {

		it('should reject if content-type is undefined', () => {
			const reqStub = {
				headers: {}
			};

			return jsonReq.validateBody(reqStub)
				.should.be.rejectedWith(Error, str.errMsg.noContentType);
		});

		it('should reject if content-type is not equal to application/json', () => {
			const reqStub = {
				headers: {
					'content-type': 'text'
				}
			};

			return jsonReq.validateBody(reqStub)
				.should.be.rejectedWith(Error, str.errMsg.invalidContentType 
					+ reqStub.headers['content-type']);
		});

		it('should reject if request body is undefined', () => {
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: undefined
			};

			return jsonReq.validateBody(reqStub)
				.should.be.rejectedWith(Error, str.errMsg.invalidReqBody);
		});

		it('should reject if request body is null', () => {
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: null
			};

			return jsonReq.validateBody(reqStub)
				.should.be.rejectedWith(Error, str.errMsg.invalidReqBody);
		});

		it('should resolve the req.body if content-type is application/json and req.body is valid', () => {
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: 'validBody'
			};

			return jsonReq.validateBody(reqStub).should.eventually.equal(reqStub.body);
		});

	});

	describe('#validateMongoId', () => {

		it('function validateMongoId should exist', () => {
			expect(jsonReq.validateMongoId).to.exist;
		});

		it('should reject if mongoId is not a valid MongoId', () => {
			return jsonReq.validateMongoId(invalidMongoId)
				.should.be.rejectedWith(Error, str.errMsg.invalidMongoId);
		});

		it('should resolve if mongoId is a valid MongoId', () => {
			return jsonReq.validateMongoId(validMongoId).should.be.fulfilled;
		});

	});

});