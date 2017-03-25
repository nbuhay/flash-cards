var resCode = require('../../config').resCode();
var express = require('express');
var router = express.Router();
const indexCtrl = require('../controllers/indexCtrl');
const renderRes = require('../modules/renderResponse');

/* GET home page. */
router.get('/', function (req, res) {
	res.status(200);
  res.render('index');
});

router.get('/signup', function (req, res) {
	res.status(200);
	res.render('signup');
});

router.get('/home', (req, res) => {
	indexCtrl.loadUserHome(req, res)
		.then((user) => renderRes.send(res, resCode['OK'], 'home', user))
});

module.exports = router;
