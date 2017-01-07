function errorHeader(filepath) {
	if (!(typeof filepath === 'string')) {
		throw new TypeError('expected a string, got ' + typeof filepath, __filename);
	} else if (filepath.length === 0) {
		throw new TypeError('expected filename but got empty string', __filename);
	} else if (!/^.*\\.*$/.test(filepath) && !/^.*\/.*$/.test(filepath)) {
		throw new TypeError(
			'expected valid filepath with at least one backslash or forward slash but got: ' 
			+ filepath, __filename);
	}

	var appName = '';

	// get first app name that evaluates to true 
	switch (true) {
		case /^.*dbAPI.*$/.test(filepath):
			appName = 'dbAPI';
			break;
		case /^.*webserver.*$/.test(filepath):
			appName = 'webserver';
			break;
		case /^.*test.*$/.test(filepath):
			appName = 'test';
			break;
		default:
			appName = 'unknown';
	}

	var filename = filepath.slice(filepath.lastIndexOf('\\') + 1, -3);

	var errorHeading = 'error:' + appName + '.' + filename + '.';
	return errorHeading;
}

module.exports = errorHeader;