var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	userName: String,
	pswd: String,
	email: {
		domainId: String,
		domain: String,
		extension: String
	},
	zip: Number,
	decks: {
		created: [String],
		learning: [{
			refDeck: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Deck'
			},
			flashCards: [{
				question: { 
					type: [String],
					required: true
				},
				answer: { 
					type: [String],
					required: true
				},
				gotCorrect: Boolean,
				lastSeen: Date,
				lastCorrect: Date,
				correctStreak: Number		
			}]
		}]
	}
});

module.exports = mongoose.model('User', userSchema);
