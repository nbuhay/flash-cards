var express = require('express');
var router = express.Router();
var deckCtrl = require('../controllers/deckCtrl');

router.get('/form', function(req, res) {
	res.render("deckForm");
});

router.get("/form/create", function(req, res) {
  res.status(200);
  res.render("deckCreate");
});

router.get("/create/cards", function(req, res) {
	res.status(200);
	res.render("deckCreateCards");
});

router.get('/learn/card/question', function(req, res) {
	deckCtrl.loadDeck(res, req, function (data) {
		console.log(data);
		res.status(200);
		res.render('question', data);
	});
});

router.get("/learn/card/answer", function(req, res) {
	res.status(200);
	res.render("answer");
});

router.get("/search", function (req, res) {
  res.status(200);
  res.send("<h1>Search</h1>")
});

module.exports = router;