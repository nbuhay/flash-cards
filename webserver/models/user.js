var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	userName: String,
	pswd: String,
	email: String,
	zip: Number,
	decks: {
		created: [String],
		fav: [String]
	}
});

var User = mongoose.model('User', userSchema);
