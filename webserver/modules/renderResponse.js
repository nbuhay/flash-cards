module.exports.send = function (res, status, view, data) {
	res.status(status).render(view, data);
}