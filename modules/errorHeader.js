const str = require('appStrings').modules.errorHeader;

function errorHeader(filepath) {
	if (!(typeof filepath === 'string')) {
		throw new TypeError(str.errMsg.expectStr + typeof filepath, __filename);
	} else if (filepath.length === 0) {
		throw new TypeError(str.errMsg.expectFilename, __filename);
	} else if (!/^.*\\.*$/.test(filepath) && !/^.*\/.*$/.test(filepath)) {
		throw new TypeError(str.errMsg.expectFilepath 
			+ filepath, __filename);
	}

	var appName = '';

	// get first app name that evaluates to true 
	switch (true) {
		case /^.*dbAPI.*$/.test(filepath):
			appName = str.appName.dbAPI;
			break;
		case /^.*webserver.*$/.test(filepath):
			appName = str.appName.webserver;
			break;
		case /^.*test.*$/.test(filepath):
			appName = str.appName.test;
			break;
		default:
			appName = str.appName.default;
	}

	var filename = filepath.slice(filepath.lastIndexOf('\\') + 1, -3);

	var errorHeading = 'error:' + appName + '.' + filename + '.';
	return errorHeading;
}

module.exports = errorHeader;