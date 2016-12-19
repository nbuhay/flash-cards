const RES = {
	OK: 200,
	SERVFAIL: 500,
	NOTFOUND: 404
};
const PORT = 3000;
const TEST_DECK = 0;
const TEST_USER = 0;

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