var express = require('express');
var router = express.Router();
var home = require('../controllers/homeCtrl');

/* GET home page. */
router.get('/', function (req, res) {
	res.status(200);
  res.render('index');
});

router.get('/signup', function (req, res) {
	res.status(200);
	res.render('signup');
});

router.get('/home', function (req, res) {
	res.status(200);
	res.render('home', { data: home.getTestUser() });
});

module.exports = router;