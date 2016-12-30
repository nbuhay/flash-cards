const config = require('../../global.js').config();
const resCode = require('../../global.js').resCode();
const jsonRes = require('../modules/jsonResponse');
const http = require('http');
const userId = "000000000000000000000000";
const errHeader = 'error:webserver:homeCtrl.';

// GET user
// return user to next
module.exports.loadUserHome = (req, res, next) => {
	var options = {
		port: config.dbPort,
		path: '/api/user/_id/' + userId
	};
	return new Promise((resolve, reject) => {
		var callback = (response) => {
			var user = '';
			response
				.on('data', (chunk) => user += chunk)
				.on('end', () => {
					if (response.statusCode != resCode['OK']) {
						reject('dbAPIRequest: badStatusCode:' + response.statusCode);
					}
					resolve(JSON.parse(user));
				});
		}
		var request = http.request(options, callback);
		request.on('error', (err) => reject('dbAPIRequest: ' + err));
		request.end();		
	})
	.then((user) => {
		if (!user) {
			reject('dbAPIRequest: returned null user');
		}
		next(user);
	})
	.catch((reason) => {
		var content = { message: errHeader + 'loadUserHome.' + reason }
		jsonRes.send(res, resCode['SERVFAIL'], content);
	});
};