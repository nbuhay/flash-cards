const env = require('env.json');
const mockDeckCards = require('mockData/deckCards').cards;
const mockDecks = require('mockData/decks').decks;
const mockUsers = require('mockData/users').users;
const resCode = {
	OK: 200,
	SERVFAIL: 500,
	NOTFOUND: 404,
	CREATED: 201,
	NOMOD: 304,
	BADREQ: 400,
	UNAUTH: 401,
	FORBID: 403
};
const testDeckCard = 0;
const testDeck = 0;
const testUser = 0;
const mongoIdRe = /^[0-9a-fA-F]{24}$/;
const usernameSettings = {
	length: {
		min: 2,
		max: 21
	}
};
const pswdSettings = {
	length: {
		min: 8,
		max: 256
	}
};

module.exports.config = () => {
	var node_env = [process.env.NODE_ENV || 'dev'];
	return env[node_env];
}

module.exports.mockDeckCards = () => {
	return mockDeckCards;
}

module.exports.mockDecks = () => {
	return mockDecks;
}

module.exports.mockUsers = () => {
	return mockUsers;
}

module.exports.resCode = () => {
	return resCode;
}

module.exports.testDeckCard = () => {
	return testDeckCard;
}

module.exports.testDeck = () => {
	return testDeck;
}

module.exports.testUser = () => {
	return testUser;
}

module.exports.mongoIdRe = () => {
	return mongoIdRe;
}

module.exports.usernameSettings = () => {
	return usernameSettings;
}

module.exports.pswdSettings = () => {
	return pswdSettings;
}