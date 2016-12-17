var mongoose = require('mongoose');

var cardSchema = mongoose.Schema({
		question: String,
		answer: String,
		gotCorrect: Boolean,
		lastSeen: Date,
		lastCorrect: Date,
		correctStreak: Number
});

module.exports = mongoose.model('Card', cardSchema);