const resCode = require('../../config').resCode();
var express = require('express');
var router = express.Router();
var deckCtrl = require('../controllers/deckCtrl');

router.get('/form', function(req, res) {
	res.render('deckForm');
});

router.get('/form/create', function(req, res) {
  res.status(200);
  res.render('deckCreate');
});

router.get('/create/cards', function(req, res) {
	res.status(200);
	res.render('deckCreateCards');
});

router.get('/learn/_id/:deck_id', (req, res) => {
	deckCtrl.loadDeck(req, res, (deck) => {
		res.status(resCode['OK']).render('question', deck);
	});
});

router.get('/learn/card/answer', function(req, res) {
	res.status(200);
	res.render('answer');
});

router.get('/search', function (req, res) {
  res.status(200);
  res.send('<h1>Search</h1>')
});

router.get('/edit', function (req, res) {
  res.status(200);
  res.send('<h1>Edit</h1>')
});

router.get('/delete', function (req, res) {
  res.status(200);
  res.send('<h1>Delete</h1>')
});

module.exports = router;