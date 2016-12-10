var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.getTestUser = function(req, res) {
	var bu = new User({
		userName: 'Bu',
		pswd: 'abc123',
		email: 'nichobu@flash.com',
		zip: 55555,
		decks: {
			created: ['a', 'b', 'c'],
			fav: ['d', 'e', 'f']
		}
	});

	return bu;
};