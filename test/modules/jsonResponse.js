const str = require('appStrings').modules.jsonResponse;
const jsonRes = require('modules/jsonResponse');
const assert = require('chai').assert;
const sinon = require('sinon');
const resCode = require('config').resCode();

describe.only('jsonResponse.js', () => {

	var sandbox;

	before(() => {
		sandbox = sinon.sandbox.create();
	});

	after(() => {
		sandbox.restore();
	})

	describe('#send', () => {

		it('should reject unsupported status codes', () => {
			unsupportedResCode = 188;
			const content = '';
			const setStatus = function (status) {
					this.statusCode = status;
					return this;
			};
			const returnJson = function (content) {
					return this;
			};
			const resStub = {
				statusCode: '',
				status: setStatus,
				json: returnJson
			};
			assert.throws(() => { jsonRes.send(resStub, unsupportedResCode, content) },	
				Error, str.errMsg.badResCode);
		});

	});

});