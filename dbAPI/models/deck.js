var mongoose = require('mongoose');

var deckSchema = mongoose.Schema({
	name: String,
	description: String,
	tags: [String],
	cards: [
		{
			question: String,
			answer: String
		}],
	favs: Number
});

module.exports = mongoose.model('Deck', deckSchema);