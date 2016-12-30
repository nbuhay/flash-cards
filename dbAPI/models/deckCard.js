var mongoose = require('mongoose');

var deckCardSchema = mongoose.Schema({
	question: { 
		type: [String],
		required: true
	},
	answer: { 
		type: [String],
		required: true
	}
});

module.exports = mongoose.model('DeckCard', deckCardSchema);