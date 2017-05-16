const jsonRes = require('modules/jsonResponse');

module.exports = (type, res, resCode, content) => {
	return {
		jsonRes: jsonRes.send(res, resCode, content)
	}[type];
};