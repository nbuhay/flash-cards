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

var Deck = mongoose.model('Deck', deckSchema);