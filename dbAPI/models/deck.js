var mongoose = require('mongoose');

var deckSchema = mongoose.Schema({
	creator: {
		required: true,
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	name: {
		required: true,
		type: String
	},
	description: {
		required: true,
		type: String
	},
	tags: [String],
	cards: [{
		required: true,
		type: mongoose.Schema.Types.ObjectId,
		ref: 'DeckCard'
	}],
	learning: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('Deck', deckSchema);