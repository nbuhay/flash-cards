const resCode = require('../../config').resCode();
const mongoIdRe = require('../../config').mongoIdRe();
const Deck = require('../models/deck');
const jsonRes = require('../modules/jsonResponse');
const errHeader = 'error:dbAPI:deckCtrl.';

module.exports.findAll = (req, res) => {
	var query = Deck.find({});
	return query.exec()
		.then((decks) => res.status(resCode['OK']).json(decks))
		.catch((reason) => {
			var content = { message: errHeader + 'findAll: ' + reason.message };
			jsonRes.send(res, resCode['SERVFAIL'], content);
		});
}

module.exports.create = (req, res) => {
	return Deck.create(req.body)
		.then((deck) => res.status(resCode['OK']).json(deck))
		.catch((reason) => res.status(resCode['SERVFAIL'])
			.json({ message: errHeader + 'create: ' + reason.message }));
}

module.exports.findById = (req, res) => {
	if (!mongoIdRe.test(req.params._id))
		res.status(resCode['BADREQ']).json({ message: errHeader + 'findById: invalid _id' });
	var query = Deck.findById(req.params._id);
	var options = [
		{
			path: 'creator',
			select: 'userName email',
		},
		{
			path: 'cards'
		}
	];
	return query.populate(options).exec()
		.then((deck) => (res.status(resCode['OK']).json(deck)))
		.catch((reason) => res.status(resCode['SERVFAIL'])
			.json({ message: errHeader + 'findById: ' + reason.message }));
}

module.exports.findByIdAndUpdate = (req, res) => {
	// options params.req._id
	// findByIdAndUpdate, passing options and req body
	// see what it returns, promise probability
	var promise = new Promise((resolve, reject) => {
		var options = {
			new: true
		};
		var updatedDeck = req.body;
		delete updatedDeck._id;
		Deck.findByIdAndUpdate(req.params._id, updatedDeck, options, (err, deck) => {
			if (err) reject('findByIdAndUpdate:' + err);
			resolve(deck);
		});
	})
	.then((resolveValue) => {
		jsonRes.send(res, resCode['OK'], resolveValue);
	})
	.then(undefined, (rejectValue) => {
		jsonRes.send(res, resCode['SERVFAIL'], { message: 'error:dbAPI:deckCtrl.' + rejectValue });
	});
};

module.exports.findOneAndRemove = (req, res) => {
	var promise = new Promise((resolve, reject) => {
		var options = {
			_id: req.params._id
		};
		Deck.findOneAndRemove(options, (err, user) => {
			if (err) {
				reject('findOneAndRemove:%s', err);
			}
			resolve('findOneAndRemove:success:%s', user);
		});
	})
	.then((resolveValue) => {
		jsonRes.send(res, resCode['OK'], resolveValue);
	})
	.then(undefined, (rejectValue) => {
		jsonRes.send(res, resCode['SERVFAIL'], rejectValue);
	});
};