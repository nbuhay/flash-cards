const str = require('appStrings').dbAPI.controllers.userCardCtrl;
const config = require('config').config();
const resCode = require('config').resCode();
const jsonRes = require('modules/jsonResponse');
const jsonReq = require('modules/jsonRequest');
const errHeader = require('modules/errorHeader')(__filename);
const UserCard = require('dbAPI/models/userCard');
const mongoose = require('mongoose');

function QueryFactory(type, conditions, options) {
	return {
		findAll: UserCard.find(conditions)
	}[type];
}

function ResFactory(type, res, resCode, content) {
	return {
		jsonRes: jsonRes.send(res, resCode, content)
	}[type];
}


function findAll(req, res) {
	return QueryFactory('findAll', {}).exec()
		.then((userCards) => ResFactory('jsonRes', res, resCode['OK'], userCards))
		.catch((reason) => {
			if (reason === undefined) {
				var content = { message: errHeader + 'findAll: ' + str.errMsg.checkQuery };
				ResFactory('jsonRes', res, resCode['SERVFAIL'], content);
			}
		});
};

module.exports = {
	findAll
};