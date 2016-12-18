var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var Deck = require('../models/deck');
var jsonRes = require('../modules/jsonResponse');

module.exports.findOne = function (req, res) {
	var options;
	if (req.params.userName) {
		options = { 'userName': req.params.userName };
	} else if (req.params.email) {
		// NO WAY TO SEACH BY EMAIL IF EMAIL IS DIFFERENT IN THE DB
		options = { 
			'email': ((req.params.email.split('.')).join('').split('@')).join('') 
		};
	}

	User.findOne(options, (err, user) => {
		if (err) console.log("Error");
		jsonRes.send(res, 200, user);
	});
}

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
}

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
}