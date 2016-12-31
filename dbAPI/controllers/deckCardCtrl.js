const resCode = require('../../config').resCode();
const jsonRes = require('../modules/jsonResponse');
const errHeader = 'error:dbAPI:deckCtrl.';

module.exports.findAll = (req, res) => {
	jsonRes.send(res, resCode['OK'], { message: 'alive' });
};