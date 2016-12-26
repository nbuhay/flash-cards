const env = require('./env.json');
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
const PORT = 3000;
const testDeck = 0;
const TEST_USER = 0;

module.exports.config = () => {
	var node_env = [process.env.NODE_ENV || 'development'];
	return env[node_env];
}

module.exports.PORT = () => {
	return PORT;
} 

module.exports.TEST_DECK = () => {
	return testDeck;
}

module.exports.TEST_USER = () => {
	return TEST_USER;
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