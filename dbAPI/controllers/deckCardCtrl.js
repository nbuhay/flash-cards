const resCode = require('../../config').resCode();
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



module.exports = { findAll };