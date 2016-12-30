var mongoose = require('mongoose');

var userCardSchema = mongoose.Schema({
		deckCard: {
			required: true,
			type: mongoose.Schema.Types.ObjectId,
			ref: 'DeckCard'
		},
		gotCorrect: {
			required: true,
			type: Boolean,
			default: false,
		},
		lastSeen: {
			required: true,
			type: Date,
			default: Date.now
		},
		lastCorrect: {
			required: true,
			type: Date,
			default: Date.now
		},
		correctStreak: {
			required: true,
			type: Number,
			default: 0
		}
});

module.exports = mongoose.model('UserCard', userCardSchema);