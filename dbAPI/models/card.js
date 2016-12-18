var mongoose = require('mongoose');

var cardSchema = mongoose.Schema({
		question: { 
			type: String,
			required: true
		},
		answer: { 
			type: String,
			required: true
		},
		gotCorrect: Boolean,
		lastSeen: Date,
		lastCorrect: Date,
		correctStreak: Number
});

module.exports = mongoose.model('Card', cardSchema);