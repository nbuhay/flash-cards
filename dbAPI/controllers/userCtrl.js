var CONST = require('../../global.js');
const config = require('../../global').config();
const resCode = require('../../global').resCode();
var User = require('../models/user');
var Deck = require('../models/deck');
var jsonRes = require('../modules/jsonResponse');
const errHeader = 'error:dbAPI:userCtrl.';

module.exports.findAll = (req, res) => {
	User.find((err, users) => {
		if (err) {
			jsonRes.send(res, CONST.RES('SERVFAIL'), {'msg': err});
		}
		jsonRes.send(res, CONST.RES('OK'), users);
	});
};

module.exports.findById = (req, res) => {
	var options = {
		_id: req.params._id
	};
	User.findById(options, (err, user) => {
		if (err) {
			jsonRes.send(res, CONST.RES('SERVFAIL'), { msg:  err });
		}
		jsonRes.send(res, CONST.RES('OK'), user);
	});
};

module.exports.save = (req, res) => {
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

module.exports.findByIdAndUpdate = (req, res) => {
	User.findByIdAndUpdate(req.params._id, req.body, (err, user) => {
		if (err) {
			jsonRes.send(res, CONST.RES('SERVFAIL'), { msg: err });
		}
		jsonRes.send(res, CONST.RES('OK'), {msg: 'Update Succesful'});
	});
};

module.exports.findByName = (req, res) => {
	User.findOne({'userName': req.params.userName}, (err, user) => {
		if (err) console.log("Error");
		jsonRes.send(res, 200, user);
	});
};

module.exports.findOneAndRemove = (req, res) => {
	var options = {
		_id: req.params._id
	};
	User.findOneAndRemove(options, (err, user) => {
		if (err) {
			jsonRes.send(res, CONST.RES('SERVFAIL'), { msg: 'findOneAndRemove.findOneAndRemove.error: ' + err} );
		}
		jsonRes.send(res, CONST.RES('OK'), { msg: 'user.' + user._id + ' sucessfully deleted!'});
	});
};

module.exports.saveLearning = (req, res) => {
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

module.exports.findByIdAndRemoveLearning = (req, res) => {
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