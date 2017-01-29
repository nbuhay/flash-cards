const assert = require('chai').assert;
const str = require('appStrings').modules.errorHeader;
const errorHeader = require('modules/errorHeader');

describe('errorHeader.js', () => {

	describe('#errorHeader', () => {

		it('function named errorHeader should exist', () => {
			assert(errorHeader.name);
		});

		it('should throw a TypeError if the typeof the arg is not a string', () => {
			const invalidArgs = [ {}, 4, [], true, () => {}, undefined, null, NaN];
			const expectedErrMsg = str.errMsg.expectStr;

			for (var i = 0; i < invalidArgs.length; i++) {
				assert.throws(() => errorHeader(invalidArgs[i]), TypeError,
					expectedErrMsg + typeof invalidArgs[i]);
			}
		});

		it('should throw a TypeError if passed the empty string', () => {
			const emptyString = '';
			const expectedErrMsg = str.errMsg.expectFilename;
			assert.throws(() => errorHeader(emptyString), TypeError, expectedErrMsg);
		});

		it('should reject filepaths with no backslash or forward slash', () => {
			const invalidFilepath = 'noSlashes';
			const expectedErrMsg = str.errMsg.expectFilepath	+ invalidFilepath;

			assert.throws(() => errorHeader(invalidFilepath), TypeError, expectedErrMsg);
		});

		it('should return a string', () => {
			assert.typeOf(errorHeader('\\'), 'string');
		});

		it('should match \'dbAPI\' from the passed filepath and include it as the app name in the return string', () => {
			var filepath = '\\' + str.appName.dbAPI;

			assert.match(errorHeader(filepath), /^.*dbAPI.*$/);
		});

		it('should match \'webserver\' from the passed filepath and include it as the app name in the return string', () => {
			var filepath = '\\' + str.appName.webserver;

			assert.match(errorHeader(filepath), /^.*webserver.*$/);
		});

		it('should match \'test\' from the passed filepath and include it as the app name in the return string', () => {
			var filepath = '\\' + str.appName.test;

			assert.match(errorHeader(filepath), /^.*test.*$/);
		});

		it('should return \'unknown\' as the app name when no known app name is found in the filepath', () => {
			var filepath = '\\abcd';

			assert.match(errorHeader(filepath), /^.*unknown.*$/);
		});

		it('should include the calling filename from the filepath in the return string', () => {
			var filepath = '\\some\\filename.js';

			assert.match(errorHeader(filepath), /^.*filename.*$/);
		});

		it('should have a return string format of \'error:appName.filename.\'', () => {
			var appName = str.appName.dbAPI;
			var filename = 'filename.js';
			var filepath = '.\\some\\' + appName + '\\filepath\\' + filename;

			assert.match(errorHeader(filepath), /^error:dbAPI\.filename\.$/);
		});

	});

});