const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const jsonReq = require('modules/jsonRequest');

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
				.should.be.rejectedWith(Error, 'missing header content-type');
		});

		it('should reject if content-type is not equal to application/json', () => {
			const reqStub = {
				headers: {
					'content-type': 'text'
				}
			};

			return jsonReq.validateBody(reqStub).should.be.rejectedWith(Error,
				'content-type should be application/json, got ' + reqStub.headers['content-type']);
		});

		it('should reject if request body is undefined', () => {
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: undefined
			};

			return jsonReq.validateBody(reqStub).should.be.rejectedWith(Error, 'invalid req body');
		});

		it('should reject if request body is null', () => {
			const reqStub = {
				headers: {
					'content-type': 'application/json'
				},
				body: null
			};

			return jsonReq.validateBody(reqStub).should.be.rejectedWith(Error, 'invalid req body');
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

	describe('#validateStringArray', () => {

		it('should reject if stringArray is an object', () => {
			const stringArrayStub = {};

			return jsonReq.validateStringArray(stringArrayStub).should.be.rejectedWith(Error, 
				'invalid field: expected array, got ' + typeof stringArrayStub);
		});

		it('should reject if stringArray is undefined', () => {
			const stringArrayStub = undefined;

			return jsonReq.validateStringArray(stringArrayStub).should.be.rejectedWith(Error, 
				'invalid field: expected array, got ' + typeof stringArrayStub);
		});

		it('should reject if stringArray is null', () => {
			const stringArrayStub = null;

			return jsonReq.validateStringArray(stringArrayStub).should.be.rejectedWith(Error, 
				'invalid field: expected array, got ' + typeof stringArrayStub);
		});

		it('should reject if stringArray is a string', () => {
			const stringArrayStub = '';

			return jsonReq.validateStringArray(stringArrayStub).should.be.rejectedWith(Error, 
				'invalid field: expected array, got ' + typeof stringArrayStub);
		});

		it('should reject if stringArray is not an array of only strings', () => {
			const stringArrayStub = ['', 'abcd', {}];

			return jsonReq.validateStringArray(stringArrayStub).should.be.rejectedWith(Error,
				'must be an array of only strings');
		});

		it('should resolve the stringArray if stringArray is an array of only strings', () => {
			const stringArrayStub = ['', 'abcd'];
			
			return jsonReq.validateStringArray(stringArrayStub)
				.should.eventually.equal(stringArrayStub);
		});

	});

});