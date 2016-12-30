const env = require('./env.json');
const mockUsers = require('./mockData/users').users;
const mockDecks = require('./mockData/decks').decks;
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
const port = 3000;
const testDeck = 0;
const testUser = 0;
const mongoIdRe = /^[0-9a-fA-F]{24}$/;

module.exports.mongoIdRe = () => {
	return mongoIdRe;
}

module.exports.config = () => {
	var node_env = [process.env.NODE_ENV || 'dev'];
	return env[node_env];
}

module.exports.PORT = () => {
	return port;
} 

module.exports.TEST_DECK = () => {
	return testDeck;
}

module.exports.TEST_USER = () => {
	return testUser;
}

module.exports.RES = (code) => {
	return resCode[code];
}

module.exports.resCode = () => {
	return resCode;
}

module.exports.testDeck = () => {
	return testDeck;
}

module.exports.testUser = () => {
	return testUser;
}

module.exports.mockDecks = () => {
	return mockDecks;
}

module.exports.mockUsers = () => {
	return mockUsers;
}