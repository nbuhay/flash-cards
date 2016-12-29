module.exports.send = function (res, status, content) {
	res.status(status).json(content);
}