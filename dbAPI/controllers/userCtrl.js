const config = require('config').config();
const resCode = require('config').resCode();
const User = require('dbAPI/models/user');
const Deck = require('dbAPI/models/deck');
const jsonRes = require('modules/jsonResponse');
const jsonReq = require('modules/jsonRequest');
const errHeader = require('modules/errorHeader')(__filename);
const mongoose = require('mongoose');

function QueryFactory(type, conditions, options) {
	return {
		find: User.find(conditions),
		findById: User.findById(conditions),
		findByIdAndRemove: User.findByIdAndRemove(conditions),
		findByIdAndUpdate: User.findByIdAndUpdate(conditions._id, conditions.update, options)
	}[type];
}

function ResFactory(type, res, resCode, content) {
	return {
		jsonRes: jsonRes.send(res, resCode, content)
	}[type];
}

function findAll(req, res) {
	const conditions = {};
	return QueryFactory('find', conditions).exec()
		.then((users) => {
			ResFactory('jsonRes', res, resCode['OK'], users);
		})
		.catch((reason) => {
			if (reason === undefined) {
				var content = { message: errHeader + 'findAll: undefined reason, check query' };
				ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
			} else {
				var content = { message: errHeader + 'findAll: ' + reason.message };
				ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
			}
		});
}

function findById(req, res) {
	return jsonReq.validateMongoId(req.params._id)
		.then(() => {
			const _id = mongoose.Types.ObjectId(req.params._id);
			return QueryFactory('findById', _id).exec();
		})
		.then((user) => {
			if (!user) {
				var content = { message: errHeader + 'findById: user does not exist' };
				ResFactory('jsonRes', res, resCode['NOTFOUND'], content);
			} else {
				ResFactory('jsonRes', res, resCode['OK'], user);			
			}
		})
		.catch((reason) => {
			var content = { message: errHeader + 'findById: ' };
			if (reason === undefined) {
				content.message += 'undefined reason, check query';
				ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
			} else {
				content.message += reason.message;
				ResFactory('jsonRes', res, resCode['BADREQ'], content);
			}
		});
}

function save(req, res) {
	var promise = new Promise((resolve, reject) => {
		var user = new User(req.body);
		user.save((err, user) => {
			if (err) reject('user.save: ' + err);
			resolve(user);
		});
	})
	.then((user) => jsonRes.send(res, resCode['OK'], user))
	.then(undefined, (reason) => {
		jsonRes(res, resCode['SERVFAIL'], { message: errHeader + 'save.' + reason })
	});
};

function findByIdAndUpdate(req, res) {
	User.findByIdAndUpdate(req.params._id, req.body, (err, user) => {
		if (err) {
			jsonRes.send(res, resCode['SERVFAIL'], { msg: err });
		}
		jsonRes.send(res, resCode['OK'], {msg: 'Update Succesful'});
	});
};

function findByName(req, res) {
	User.findOne({'userName': req.params.userName}, (err, user) => {
		if (err) console.log("Error");
		jsonRes.send(res, 200, user);
	});
};

function findOneAndRemove(req, res) {
	var options = {
		_id: req.params._id
	};
	User.findOneAndRemove(options, (err, user) => {
		if (err) {
			jsonRes.send(res, resCode['SERVFAIL'], { msg: 'findOneAndRemove.findOneAndRemove.error: ' + err} );
		}
		jsonRes.send(res, resCode['OK'], { msg: 'user.' + user._id + ' sucessfully deleted!'});
	});
};

function saveLearning(req, res) {
	var promise = new Promise((resolve, reject) => {
		// get the user object
		// save deck to user
		Deck.findById(req.params.deck_id, (err, deck) => {
			if (err) reject('Deck.findById.error: ' + err);
			resolve(deck);
		});
	})
	.then((deck) => {
		return new Promise((resolve, reject) => {
			User.findById(req.params.user_id, (err, user) => {
				if (err) reject('User.findById.error: ' + err);
				var flashCards = [];
				for (var i = 0; i < deck.cards.length; i++) {
					flashCards.push({
						question: deck.cards[i].question,
						answer: deck.cards[i].answer,
						gotCorrect: false,
						lastSeen: new Date(),
						lastCorrect: new Date(),
						correctStreak: 0
					});
				}
				user.decks.learning.push({
					refDeck: deck._id,
					name: deck.name,
					description: deck.description,
					flashCards: flashCards
				});
				resolve(user)
			});
		});
	})
	.then((user) => {
		return new Promise((resolve, reject) => {
			user.save((err, updatedUser) => {
				if (err) reject('insertLearning.user.save:error: ' + err);
				resolve(updatedUser);	
			});
		});
	})
	.then((updatedUser) => jsonRes.send(res, resCode['OK'], updatedUser))
	.then(undefined, (rejectValue) => jsonRes.send(res, resCode['SERVFAIL'], { message: 'saveLearning.' + rejectValue }));
};

function findByIdAndRemoveLearning(req, res) {
	var promise = new Promise((resolve, reject) => {
		User.findById(req.params.user_id, { 'learning' : 'decks.learning' }, (err, learning) => {
			if (err) reject('User.findById:error: ' + err);
			// find matching learning
			resolve(learning);
		});
	})
	.then((learning) => {
		return new Promise((resolve, reject) => {
			var i = 0;
			while (i < learning.length) {
				if (learning[i].refDeck == req.params.deck_id) {
					learning.splice(i, 1);
					break;
				}	
				i++;
			};
			resolve(learning);
		});
	})
	.then((updatedLearning) => {
		return new Promise((resolve, reject) => {
			User.findByIdAndUpdate(req.params.user_id, { 'decks.learning' : updatedLearning }, 
				{ new: true }, (err, updatedUser) => {
					if (err) reject('User.findByIdAndUpdate:error: ' + err);
					resolve(updatedUser);
				});
		});
	})
	.then((updatedUser) => {
		jsonRes.send(res, resCode['OK'], updatedUser);
	})
	.then(undefined, (reason) => { 
		jsonRes.send(res, resCode['SERVFAIL'], { message: errHeader + 'findByIdAndRemoveLearning.' + reason });
	});
};

function findByIdAndUpdateLearning(req, res) {
	var updates = req.body;
	return new Promise((resolve, reject) => {
		User.findById(req.params.user_id, (err, user) => {
			if (err) reject('User.findById:error: ' + err);
			resolve(user);
		})
	})
	.then((user) => {
		return new Promise((resolve, reject) => {
			User.findByIdAndUpdate(req.params.user_id, { 'decks.learning' : updates.decks.learning },
			{ 'new' : true}, (err, updatedUser) => {
				if (err) reject('User.findByIdandUpdate:error: ' + err );
				resolve(updatedUser);
			});
		});
	})
	.then((updatedUser) => {
		jsonRes.send(res, resCode['OK'], updatedUser);
	})
	.then(undefined, (reason) => {
		jsonRes.send(res, resCode['SERVFAIL'], { message: errHeader + 'findByIdAndUpdateLearning.' + reason });
	});
};

module.exports = {
	findAll,
	findById,
	save,
	findByIdAndUpdate,
	findByName,
	findOneAndRemove,
	saveLearning,
	findByIdAndRemoveLearning,
	findByIdAndUpdateLearning
}