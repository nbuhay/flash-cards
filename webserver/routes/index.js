var express = require('express');
var router = express.Router();
var deck = require('../controllers/deck');
var home = require('../controllers/home');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index');
});

router.get('/signup', function(req, res) {
	res.render('signup');
});

router.get('/home', function(req, res) {
	res.status(200);
	res.render('home', {data: home.getTestUser()});
});

router.get("/deck/form", function(req, res) {
	res.render("deckForm");
});

router.get("/deck/form/create", function(req, res) {
  res.status(200);
  res.render("deckCreate");
});

router.get("/deck/create/cards", function(req, res) {
	res.status(200);
	res.render("deckCreateCards");
});

router.get("/deck/search", function (req, res) {
  res.status(200);
  res.send("<h1>Search</h1>")
})

router.get('/test', function(req, res) {
	res.status(200);
	res.json(deck.getTestUser());
});

module.exports = router;