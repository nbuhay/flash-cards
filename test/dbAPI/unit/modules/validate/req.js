const errMsg = require('appStrings').dbAPI.modules.req.errMsg;
const vReq = require('dbAPI/modules/validate/req');

describe('req.js', () => {

	it('reject if header content-type is undefined', () => {
			const reqStub = { headers: {} };
			return vReq.validate(reqStub).should.be.rejectedWith(errMsg.noContentType);
	});

	it('reject if content-type is not application/json', () => {
		const reqStub = { headers: { 'content-type': 'text' }	};
		const content = errMsg.invalidContentType + reqStub.headers['content-type'];
		return vReq.validate(reqStub).should.be.rejectedWith(content);
	});

	it('reject if body is undefined', () => {
		const reqStub = {
			headers: { 'content-type': 'application/json' },
			body: undefined
		};
		return vReq.validate(reqStub).should.be.rejectedWith(errMsg.invalidReqBody);
	});

	it('reject if body is null', () => {
		const reqStub = {
			headers: { 'content-type': 'application/json' },
			body: null
		};
		return vReq.validate(reqStub).should.be.rejectedWith(errMsg.invalidReqBody);
	});

	it('resolve if content-type is application/json and body is valid', () => {
		const reqStub = {
			headers: { 'content-type': 'application/json' },
			body: 'validBody'
		};
		return vReq.validate(reqStub).should.be.fulfilled;
	});

});