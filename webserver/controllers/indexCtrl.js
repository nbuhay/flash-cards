const config = require('../../config.js').config();
const resCode = require('../../config.js').resCode();
const jsonRes = require('../modules/jsonResponse');
const http = require('http');
const userId = "000000000000000000000000";
const errHeader = 'error:webserver:indexCtrl.';

// GET user
// return user to next
module.exports.loadUserHome = (req, res, next) => {
	return new Promise((resolve, reject) => {
		var options = {
			port: config.app.dbAPI.port,
			path: '/api/user/_id/' + userId
		};
		var callback = (response) => {
			var user = '';
			response
				.on('data', (chunk) => user += chunk)
				.on('end', () => {
					if (response.statusCode != resCode['OK']) {
						reject('dbAPIRequest: badStatusCode:' + response.statusCode);
					}
					(user = JSON.parse(user)) ? 
						resolve(user) : reject('dbAPIRequest: returned null user');
			});
		}
		var request = http.request(options, callback);
		request.on('error', (err) => reject('dbAPIRequest: ' + err));
		request.end();		
	})
	.then((user) => {
		next(user);
	})
	.catch((reason) => {
		var content = { message: errHeader + 'loadUserHome.' + reason }
		jsonRes.send(res, resCode['SERVFAIL'], content);
	});
};