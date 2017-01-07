const resCode = require('config').resCode();
const mongoIdRe = require('config').mongoIdRe();
const jsonRes = require('dbAPI/modules/jsonResponse');
const errHeader = require('modules/errorHeader')(__filename);
const DeckCard = require('dbAPI/models/deckCard');

function QueryFactory(type, conditions) {
	return {
		find: DeckCard.find(conditions),
		findById: DeckCard.findById(conditions)
	}[type];
}

function ResFactory(type, res, resCode, content) {
	return {
		jsonRes: jsonRes.send(res, resCode, content)
	}[type];
}

function findAll(req, res) {
	var conditions = {};
	var query = QueryFactory('find', conditions);
	return query.exec()
		.then((deckCards) => {
			ResFactory('jsonRes', res, resCode['OK'], deckCards);
		})
		.catch((reason) => {
			var content = { message: errHeader + 'findAll: ' + reason.message };
			ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
		});
}

function findById(req, res) {
	return new Promise((resolve, reject) => {
		if (!mongoIdRe.test(req.params._id)) {
			reject({ message: 'req invalid param _id' });
		} else {
			resolve();
		}
	})
	.then(() => { return QueryFactory('findById', req.params._id).exec(); })
	.then((deckCard) => {
		if (!deckCard) {
			var content = { message: errHeader + 'findById: deckCard does not exist' };
			ResFactory('jsonRes', res, resCode['NOTFOUND'], content);
		} else {
			ResFactory('jsonRes', res, resCode['OK'], deckCard);			
		}
	})
	.catch((reason) => {
		if (reason == undefined) {
			var content = { message: errHeader + 'findById: undefined reason, check query' };
			ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
		} else {
			var content = { message: errHeader + 'findAll: ' + reason.message };
			ResFactory('jsonRes', res, resCode['BADREQ'], content);
		}
	});
}

module.exports = {
	findAll,
	findById
};