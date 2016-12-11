var express = require('express');
var router = express.Router();
var userCtrl = require('../controllers/userCtrl');

router.get('/mockData', userCtrl.mockData);
router.get('/user/:userName', userCtrl.oneUser);

module.exports = router;