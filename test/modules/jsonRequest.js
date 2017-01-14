const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const jsonReq = require('modules/jsonRequest');

chai.use(chaiAsPromised);
const expect = chai.expect;
chai.should();

describe.only('jsonRequest.js', () => {

	describe('#validate', () => {

		it('should reject if content-type is undefined', () => {
			const reqStub = {
				headers: {}
			};

			return jsonReq.validate(reqStub)
				.should.be.rejectedWith(Error, 'missing header content-type');
		});

		it('should reject if content-type is not equal to application/json', () => {
			const reqStub = {
				headers: {
					'content-type': 'text'
				}
			};

			return jsonReq.validate(reqStub).should.be.rejectedWith(Error,
				'content-type should be application/json, got ' + reqStub.headers['content-type']);
		});

		it('should reject if request body is undefined', () => {
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: undefined
			};

			return jsonReq.validate(reqStub).should.be.rejectedWith(Error, 'invalid req body');
		});

		it('should reject if request body is null', () => {
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: null
			};

			return jsonReq.validate(reqStub).should.be.rejectedWith(Error, 'invalid req body');
		});

		it('should resolve the req.body if content-type is application/json and req.body is valid', () => {
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: 'validBody'
			};

			return jsonReq.validate(reqStub).should.eventually.equal(reqStub.body);
		});

	});

});