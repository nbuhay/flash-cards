module.exports.send = (res, status, view, content) => {
	res.status(status).render(view, content);
}