const errorHeader = require('../../modules/errorHeader');
const assert = require('chai').assert;

describe('errorHeader.js', () => {

	describe('#errorHeader', () => {

		it('function named errorHeader should exist', () => {
			assert(errorHeader.name);
		});

		it('should throw a TypeError if the typeof the arg is not a string', () => {
			var invalidArgs = [ {}, 4, [], true, () => {}, undefined, null, NaN];
			var expectedErrMsg = 'expected a string, got ';

			for (var i = 0; i < invalidArgs.length; i++) {
				// console.log(typeof invalidArgs[i])
				assert.throws(() => errorHeader(invalidArgs[i]), TypeError,
				expectedErrMsg + typeof invalidArgs[i]);
			}
		});

		it('should throw a TypeError if passed the empty string', () => {
			var emptyString = '';
			var expectedErrMsg = 'expected filename but got empty string';
			assert.throws(() => errorHeader(emptyString), TypeError, expectedErrMsg);
		});

		it('should reject filepaths with no backslash or forward slash', () => {
			var invalidFilepath = 'noSlashes';
			var expectedErrMsg = 
				'expected valid filepath with at least one backslash or forward slash but got: ' 
				+ invalidFilepath;

			assert.throws(() => errorHeader(invalidFilepath), TypeError, expectedErrMsg);
		});

		it('should return a string', () => {
			assert.typeOf(errorHeader('\\'), 'string');
		});

		it('should match \'dbAPI\' from the passed filepath and include it as the app name in the return string', () => {
			var filepath = '\\dbAPI';

			assert.match(errorHeader(filepath), /^.*dbAPI.*$/);
		});

		it('should match \'webserver\' from the passed filepath and include it as the app name in the return string', () => {
			var filepath = '\\webserver';

			assert.match(errorHeader(filepath), /^.*webserver.*$/);
		});

		it('should match \'test\' from the passed filepath and include it as the app name in the return string', () => {
			var filepath = '\\test';

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
			var appName = 'dbAPI';
			var filename = 'filename.js';
			var filepath = '.\\some\\' + appName + '\\filepath\\' + filename;

			assert.match(errorHeader(filepath), /^error:dbAPI\.filename\.$/);
		});

	});

});