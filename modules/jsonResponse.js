const str = require('appStrings').modules.jsonResponse;
const resCode = require('config').resCode();

function send(res, status, content) {
	// verify supported status code
	try {
		var count = 0;
		for (code in resCode) {
			if (resCode[code] === status) count++;
		}
		if (count === 0) {
			throw Error
		}
	} catch (err) {
		throw Error(str.errMsg.badResCode);
	}
	res.status(status).json(content);
}

module.exports = {
	send
}; 