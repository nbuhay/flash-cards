var CONST = require('../../global.js');
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
			jsonRes.send(res, CONST.RES('SERVFAIL'), {'msg':  err});
		}
		jsonRes.send(res, CONST.RES('OK'), user);
	});
};

module.exports.findByName = function (req, res) {
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

module.exports.insertLearning = (req, res) => {
	var options = {
		userName: req.params.userName
	};
	User.findOne(options, (err, user) => {
		if (err) {
			jsonRes.send(res, 500 , 'insertLearning.User.findOne.error: ' + err);
		}

		var options = {
			_id: req.params.deck_id
		};

		Deck.findById(options, (err, deck) => {
			if (err) {
				jsonRes.send(res, 500 , 'insertLearning.findOne.findById.error: ' + err);
			}
			var flashCards = [];
			deck.cards.map((card) => {
				flashCards.push({
					question: card.question,
					answer: card.answer,
					gotCorrect: false,
					lastSeen: new Date(),
					lastCorrect: new Date(),
					correctStreak: 0
				});
			});
			user.decks.learning.push({
				refDeck: deck._id,
				flashCards: flashCards
			});
			user.save((err, updatedUser) => {
				if (err) {
					jsonRes.send(res, 500, 'insertLearning.findOne.findById.save.error: ' + err);
				}
				jsonRes.send(res, 200, updatedUser);
			});
		});
	});
};