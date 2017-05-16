const resCode = require('config').resCode();
const config = require('config').config();
const mongoIdRe = require('config').mongoIdRe();
const Deck = require('dbAPI/models/deck');
const http = require('http');
const jsonReq = require('modules/jsonRequest');
const errHeader = require('modules/errorHeader')(__filename);
const DeckQuery = require('dbAPI/modules/queryFactory').Deck;
const ResFactory = require('dbAPI/modules/resFactory');

function validateCreateBody(validReqBody) {
	return new Promise((resolve, reject) => {
		if (!validReqBody.hasOwnProperty('creator') || !mongoIdRe.test(validReqBody.creator)) {
			reject({ message: 'invalid creator field' });
		} else if (!validReqBody.hasOwnProperty('name') || typeof validReqBody.name !== 'string'
			|| validReqBody.name.length === 0) {
			reject({ message: 'invalid name field' });
		} else if (!validReqBody.hasOwnProperty('description') || typeof validReqBody.name !== 'string'
			|| validReqBody.name.length === 0) {
			reject({ message: 'invalid description field' });
		} else if (!validReqBody.hasOwnProperty('cards') || !(Array.isArray(validReqBody.cards))) {
			reject({ message: 'invalid cards field' });
		} else {
			resolve();
		}
	})
	.catch((reason) => { throw Error(reason.message); });
}

function checkCreatorExists(validDeckBody) {
	return new Promise((resolve, reject) => {
		const options = {
			port: config.app.dbAPI.port,
			path: '/api/user/' + validDeckBody.creator
		}
		const callback = (response) => {
			if (response.statusCode !== resCode['OK']) {
				reject({ message: 'creator does not exist in db' })
			} else {
				resolve();
			}
		}
		const request = http.request(options, callback);
		request.on('error', (err) => reject({ message: 'Request error' }));
		request.end();
	})
	.catch((reason) => { throw Error(reason.message); });
}

function findAll(req, res) {
	const conditions = {};
	return DeckQuery('find', conditions).exec()
		.then((decks) => ResFactory('jsonRes', res, resCode['OK'], decks))
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

function create(req, res) {
	return jsonReq.validateBody(req)
	.then(() => validateCreateBody(req.body))
	.then(() => checkCreatorExists(req.body))
	.then(() => Deck.create(req.body))
	.then((deck) => ResFactory('jsonRes', res, resCode['OK'], deck))
	.catch((reason) => {
		if (reason === undefined) {
			var content = { message: errHeader + 'create: ' + reason.message };
			ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
		} else {
			var content = { message: errHeader + 'create: ' + reason.message };
			ResFactory('jsonRes', res, resCode['BADREQ'], content);
		}
	});
}

function findById(req, res) {
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

function findByIdAndUpdate(req, res) {
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

function findOneAndRemove(req, res) {
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

module.exports = {
	findAll,
	create,
	findById,
	findByIdAndUpdate,
	findOneAndRemove
}