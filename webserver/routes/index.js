var express = require('express');
var router = express.Router();
var deck = require('../controllers/deck');
var home = require('../controllers/home');

/* GET home page. */
router.get('/', function (res) {
  res.render('index');
});

router.get('/signup', function(req, res) {
	res.render('signup');
});

router.get('/home', function(req, res) {
	res.status(200);
	res.render('home', {data: home.getTestUser()});
});

router.get('/deck', function(req, res) {
	res.render('deck');
});

router.get('/test', function(req, res) {
	res.status(200);
	res.json(deck.getTestUser());
});

module.exports = router;