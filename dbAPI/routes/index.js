var express = require('express');
var router = express.Router();
var mockDataCtrl = require('../controllers/mockDataCtrl');
var userCtrl = require('../controllers/userCtrl');
var deckCtrl = require('../controllers/deckCtrl');

router.get('/mockData', mockDataCtrl.insert);
router.get('/user/:userName', userCtrl.findOne);
router.get('/deck/name/:name', deckCtrl.findOne);
router.get('/deck/id/:id', deckCtrl.findOneId);

module.exports = router;