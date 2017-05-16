const User = require('dbAPI/models/user');
const UserCard = require('dbAPI/models/userCard');
const Deck = require('dbAPI/models/deck');
const DeckCard = require('dbAPI/models/deckCard');

module.exports = {
	User: (type, conditions, options) => {
		return {
			find: User.find(conditions),
			findById: User.findById(conditions)
				.populate({ path: 'decks.created' })
				.populate({ path: 'decks.learning.deck' })
				.populate({ path: 'decks.learning.userCards', populate: { path: 'deckCard' } }),
			findByIdAndRemove: User.findByIdAndRemove(conditions),
			findByIdAndUpdate: User.findByIdAndUpdate(conditions._id, conditions.update, options),
			findOne: User.findOne(conditions.conditions, conditions.projection, options),
			create: User.create(conditions)
		}[type];
	},
	UserCard: (type, conditions, options) => {
		return {
			findAll: UserCard.find(conditions),
			findById: UserCard.findById(conditions),
			create: UserCard.create(conditions),
			findByIdAndUpdate: UserCard.findByIdAndUpdate(conditions._id, conditions.updateData)
		}[type];
	},
	Deck: (type, conditions, options) => {
		return {
			find: Deck.find(conditions),
			findById: Deck.findById(conditions),
			findByIdAndRemove: Deck.findByIdAndRemove(conditions),
			findByIdAndUpdate: Deck.findByIdAndUpdate(conditions._id, conditions.update, options)
		}[type];
	},
	DeckCard: (type, conditions, options) => {
		return {
			find: DeckCard.find(conditions),
			findById: DeckCard.findById(conditions),
			findByIdAndRemove: DeckCard.findByIdAndRemove(conditions),
			findByIdAndUpdate: DeckCard.findByIdAndUpdate(conditions._id, conditions.update, options)
		}[type];
	}
};