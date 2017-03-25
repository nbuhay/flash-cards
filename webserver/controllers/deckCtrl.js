const config = require('../../config.js').config();
const resCode = require('../../config').resCode();
var http = require('http');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Deck = mongoose.model('Deck');
const userId = "000000000000000000000000";

module.exports.loadDeck = (req, res) => {
	return new Promise((resolve, reject) => {
		var options = {
			port: config.app.dbAPI.port,
			path: '/api/user/' + userId
		};
		var callback = (response) => {
			var user = '';
			response
				.on('data', (chunk) => user += chunk)
				.on('end', () => resolve((JSON.parse(user)).decks.learning));
		};
		var request = http.request(options, callback);
		request.on('error', (err) => reject({ message: 'dbAPIRequest: ' + err}))
		request.end();
	})
	.then((decks) => {
		return new Promise((resolve, reject) => {
			var i = 0;
			while (i < decks.length) {
				if (decks[i].deck._id === req.params._id) {
					resolve(decks[i]);
				}
				i++;
			}
		})
	})
	.catch((reason) => {
		res.status(resCode['SERVFAIL']).json({ message: reason.message })
	});
};