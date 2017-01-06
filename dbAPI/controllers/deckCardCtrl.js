const resCode = require('../../config').resCode();
const mongoIdRe = require('../../config').mongoIdRe();
const DeckCard = require('../models/deckCard');
const jsonRes = require('../modules/jsonResponse');
const errHeader = require('../../modules/errorHeader')(__filename);

function QueryFactory(type, conditions) {
	return {
		find: DeckCard.find(conditions),
		findById: DeckCard.findById(conditions)
	}[type];
}

function ResFactory(type, res, resCode, content) {
	return {
		jsonRes: jsonRes(res, resCode, content)
	}[type];
}

function findAll(req, res) {
	var conditions = {};
	var query = QueryFactory('find', conditions);
	return query.exec()
		.then((deckCards) => {			
			// console.log('here in resolve');
			// console.log(ResFactory('jsonRes', res, resCode['OK'], deckCards))
			ResFactory('jsonRes', res, resCode['OK'], deckCards);
		})
		.catch((reason) => {
			console.log('here in deckCardCtrl catch');
			console.log(reason.message);
			var content = { message: errHeader + 'findAll: ' + reason.message };
			ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
		});
}

// can the sync bits be wrapped in a promise?
function findById(req, res) {
	if (!mongoIdRe.test(req.params._id)) {
		var content = { message: errHeader + 'findById: req missing param _id' };
		jsonRes.send(res, resCode['BADREQ'], content);
	} else {
		var query = QueryFactory('findById', req.params._id);
		return query.exec()
			.then((deckCard) => {
				if (!deckCard) {
					var content = { message: errHeader + 'findById: deckCard does not exist' };
					jsonRes.send(res, resCode['NOTFOUND'], content);
				}
				jsonRes.send(res, resCode['OK'], deckCard);
			})
			.catch((reason) => {
				var content = { message: errHeader + 'findById: ' + reason.message };
				jsonRes.send(res, resCode['SERVFAIL'], content);
			});
	}
}

module.exports = { 
	QueryFactory,
	ResFactory,
	findAll,
	findById
};