const resCode = require('../../config').resCode();
const mongoIdRe = require('../../config').mongoIdRe();
const DeckCard = require('../models/deckCard');
const jsonRes = require('../modules/jsonResponse');
const errHeader = 'error:dbAPI:deckCardCtrl.';

function findAll(req, res) {
	var conditions = {};
	var query = DeckCard.find(conditions);
	return query.exec()
		.then((deckCards) => jsonRes.send(res, resCode['OK'], deckCards))
		.catch((reason) => {
			var content = { message: errHeader + 'findAll: ' + reason.message };
			jsonRes.send(res, resCode['SERVFAIL'], content);
		});
}

// can the sync bits be wrapped in a promise?
function findById(req, res) {
	if (!mongoIdRe.test(req.params._id)) {
		var content = { message: errHeader + 'findById: req missing param _id' };
		jsonRes.send(res, resCode['BADREQ'], content);
	} else {
		var query = DeckCard.findById(req.params._id);
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
	findAll,
	findById
};