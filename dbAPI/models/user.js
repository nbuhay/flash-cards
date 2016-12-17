var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	userName: String,
	pswd: String,
	email: {
		type: String,
		required: true
	},
	zip: Number,
	decks: {
		created: [String],
		learning: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Card'
			}
		]
	}
});

module.exports = mongoose.model('User', userSchema);
