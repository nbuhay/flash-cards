const env = require('./env.json');

const RES = {
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
const TEST_DECK = 0;
const TEST_USER = 0;


module.exports.config = () => {
	var node_env = [process.env.NODE_ENV || 'development'];
	return env[node_env];
}

module.exports.PORT = () => {
	return PORT;
} 

module.exports.TEST_DECK = () => {
	return TEST_DECK;
}

module.exports.TEST_USER = () => {
	return TEST_USER;
}

module.exports.RES = (code) => {
	return RES[code];
}