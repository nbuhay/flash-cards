var express = require('express');
var router = express.Router();
var homeCtrl = require('../controllers/homeCtrl');

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
	homeCtrl.loadUserHome(req, res, function (data) {
			res.status(200);
			res.render('home', { data: data });
	});
});

module.exports = router;
