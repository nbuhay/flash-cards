var mongoose = require('mongoose');

var deckSchema = mongoose.Schema({
	name: String,
	description: String,
	tags: [String],
	cards: [{
			question: {
				type: String,
				required: true
			},
			answer: {
				type: String,
				required: true
			}
		}],
	favs: Number
});

module.exports = mongoose.model('Deck', deckSchema);