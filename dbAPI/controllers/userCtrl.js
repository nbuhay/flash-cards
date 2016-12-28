var CONST = require('../../global.js');
const config = require('../../global').config();
const resCode = require('../../global').resCode();
var User = require('../models/user');
var Deck = require('../models/deck');
var jsonRes = require('../modules/jsonResponse');

module.exports.findAll = (req, res) => {
	User.find((err, users) => {
		if (err) {
			jsonRes.send(res, CONST.RES('SERVFAIL'), {'msg': err});
		}
		jsonRes.send(res, CONST.RES('OK'), users);
	});
};

module.exports.newUser = (req, res) => {
	var body = [];
	req.on('data', (chunk) => {
		body.push(chunk);
	}).on('end', () => {
		// combine all array elments into single string
		var user = new User(JSON.parse(body.join()));
		user.save((err) => {
			if (err) {
				jsonRes.send(res, 500, 'Internal Server Error');
			}
			jsonRes.send(res, 200, JSON.parse(body.join()));
		});
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
		console.log('====here=====');
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
				console.log('updateUser: ' + updatedUser);
				if (err) reject('insertLearning.user.save:error: ' + err);
				resolve(updatedUser);	
			});
		});
	})
	.then((updatedUser) => jsonRes.send(res, resCode['OK'], updatedUser))
	.then(undefined, (rejectValue) => jsonRes.send(res, resCode['SERVFAIL'], { message: 'saveLearning.' + rejectValue }));
};