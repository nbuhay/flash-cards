module.exports.send = function(res, status, content) {
	res.status(status);
	res.json(content);
};