const config = require('../../global.js').config();
const resCode = require('../../global.js').resCode();
const jsonRes = require('../modules/jsonResponse');
const http = require('http');
const userId = "000000000000000000000000";
const errHeader = 'error:webserver:homeCtrl.';

// GET user
// GET their decks
// return user and their decks
module.exports.loadUserHome = (req, res, next) => {
	// GET user
	var options = {
		port: config.dbPort,
		path: '/api/user/_id/' + userId
	};
	return new Promise((resolve, reject) => {
			console.log('in promise');
		var callback = (response) => {
			var user = '';
			response
				.on('data', (chunk) => user += chunk)
				.on('end', () => {
					if (response.statusCode != resCode['OK']) {
						reject('dbAPIRequest: badStatusCode:' + response.statusCode);
					}
					console.log('before resolve');
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
	.then(undefined, (reason) => {
		jsonRes.send(res, resCode['SERVFAIL'], { message: errHeader + 'loadUserHome.' + reason });
	});
};