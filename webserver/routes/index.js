var express = require('express');
var router = express.Router();
var deck = require('../controllers/deck');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

router.get('/signup', function(req, res) {
	res.render('signup');
});

router.get('/home', function(req, res) {
	res.render('home');
});

router.get('/deck', function(req, res) {
	res.render('deck');
});

module.exports = router;