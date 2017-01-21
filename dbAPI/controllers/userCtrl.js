const config = require('config').config();
const usernameSettings = require('config').usernameSettings();
const pswdSettings = require('config').pswdSettings();
const resCode = require('config').resCode();
const User = require('dbAPI/models/user');
const Deck = require('dbAPI/models/deck');
const jsonRes = require('modules/jsonResponse');
const jsonReq = require('modules/jsonRequest');
const errHeader = require('modules/errorHeader')(__filename);
const mongoose = require('mongoose');
const validator = require('validator');

function QueryFactory(type, conditions, options) {
	return {
		find: User.find(conditions),
		findById: User.findById(conditions),
		findByIdAndRemove: User.findByIdAndRemove(conditions),
		findByIdAndUpdate: User.findByIdAndUpdate(conditions._id, conditions.update, options),
		findOne: User.findOne(conditions.conditions, conditions.projection, options)
	}[type];
}

function ResFactory(type, res, resCode, content) {
	return {
		jsonRes: jsonRes.send(res, resCode, content)
	}[type];
}

function validateCreate(body) {
	return new Promise((resolve, reject) => {
		if (!body.hasOwnProperty('username') 
			|| body.username.length < usernameSettings.length.min
			|| body.username.length > usernameSettings.length.max) {
				reject({ message: 'invalid username' });
		} else if (!body.hasOwnProperty('pswd')
			|| body.pswd.length < pswdSettings.length.min
			|| body.pswd.length > pswdSettings.length.max) {
			reject({ message: 'invalid pswd'} );
		} else if (!body.hasOwnProperty('email')
			|| !body.email.hasOwnProperty('domainId')
			|| !body.email.hasOwnProperty('domain')
			|| !body.email.hasOwnProperty('extension')
			|| !validator.isEmail(body.email.domainId + '@' + body.email.domain + '.' + body.email.extension)) {
			reject({ message: 'invalid email'} );
		} else {
			resolve(body);
		}
	})
	.catch((reason) => { throw Error(reason.message); });
}

function validateFindOne(body) {
	return new Promise((resolve, reject) => {
		if (!body.hasOwnProperty('queryParms') 
			|| body.queryParms === undefined
			|| body.queryParms === null) {
				reject({message: 'invalid queryParms'});
		} else if (!body.queryParms.hasOwnProperty('conditions')
			|| body.queryParms.conditions === undefined
			|| body.queryParms.conditions === null) {
			reject({message: 'invalid queryParms.conditions'});
		} else if (body.queryParms.hasOwnProperty('projection') 
			&& body.queryParms.hasOwnProperty('options')) {
				if (body.queryParms.projection === undefined 
					|| body.queryParms.projection === null) {
					reject({message: 'invalid queryParms.projection'});
				} else if (body.queryParms.options === undefined 
					|| body.queryParms.options === null) {
					reject({message: 'invalid queryParms.options'});
				} else {
					resolve({
						queryParms: {
							conditions: body.queryParms.conditions,
							projection: body.queryParms.projection
						},
						options: body.queryParms.options
					})
				}
		} else if (body.queryParms.hasOwnProperty('projection')) {
			if (body.queryParms.projection === undefined
				|| body.queryParms.projection === null) {
				reject({message: 'invalid queryParms.projection'});
			} else {
				resolve({
					queryParms: {
						conditions: body.queryParms.conditions,
						projection: body.queryParms.projection
					},
					options: undefined
				});
			}
		} else if (body.queryParms.hasOwnProperty('options')){
			if (body.queryParms.options === undefined 
				|| body.queryParms.options === null) {
				reject({message: 'invalid queryParms.options'});
			} else {
				resolve({
					queryParms: {
						conditions: body.queryParms.conditions,
						projection: undefined
					},
					options: body.queryParms.options
				});
			}
		} else {
			resolve({
				queryParms: {
					conditions: body.queryParms.conditions,
					projection: undefined
				},
				options: undefined
			});
		}
	})
	.catch((reason) => { throw Error(reason.message); });
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
				ResFactory('jsonRes', res, resCode['NOTFOUND'], req.stringify);
			} else {
				if (req.method === 'HEAD') {
					ResFactory('jsonRes', res, resCode['OK']);			
				} else {
					ResFactory('jsonRes', res, resCode['OK'], user);			
				}
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

function findOne(req, res) {
	return jsonReq.validateBody(req)
		.then((validReqBody) => validateFindOne(validReqBody))
		.then((validFindOne) => {
			return QueryFactory('findOne', validFindOne.queryParms, validFindOne.options)
				.exec()
		})
		.then((user) => {
			if (!user) {
				var content = { message: errHeader + 'findOne: no matching user found' };
				ResFactory('jsonRes', res, resCode['NOTFOUND'], content);
			} else {
				ResFactory('jsonRes', res, resCode['OK'], user);
			}
		})
		.catch((reason) => {
			var content = { message: errHeader + 'findOne: ' };
			if (reason === undefined) {
				content.message += 'undefined reason, check query';
				ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
			} else {
				content.message += reason.message;
				ResFactory('jsonRes', res, resCode['BADREQ'], content);
			}
		});
}

function create(req, res) {
	return jsonReq.validateBody(req)
	.then((validReqBody) => validateCreate(validReqBody))
	.catch((reason) => {
		var content = { message: errHeader + 'create: ' };
		if (reason === undefined) {
			content.message += 'undefined reason, check query';
			ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
		} else {
			content.message += reason.message;
			ResFactory('jsonRes', res, resCode['BADREQ'], content);
		}
	});
}
function findByIdAndUpdate(req, res) {
	User.findByIdAndUpdate(req.params._id, req.body, (err, user) => {
		if (err) {
			jsonRes.send(res, resCode['SERVFAIL'], { msg: err });
		}
		jsonRes.send(res, resCode['OK'], {msg: 'Update Succesful'});
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
	findOne,
	create,
	findByIdAndUpdate,
	findOneAndRemove,
	saveLearning,
	findByIdAndRemoveLearning,
	findByIdAndUpdateLearning
}