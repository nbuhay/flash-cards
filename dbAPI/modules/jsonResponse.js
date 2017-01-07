function send(res, status, content) {
	res.status(status).json(content);
}

module.exports = {
	send
}; 