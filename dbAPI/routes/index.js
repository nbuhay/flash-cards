var express = require('express');
var router = express.Router();
var mockDataCtrl = require('../controllers/mockDataCtrl');
var userCtrl = require('../controllers/userCtrl');
var deckCtrl = require('../controllers/deckCtrl');

router.get('/mockData', mockDataCtrl.insert);
router.get('/mockData/users', mockDataCtrl.insertUsers);
router.get('/mockData/decks', mockDataCtrl.insertDecks);

router.get('/user', userCtrl.findAll);
router.post('/user', userCtrl.newUser);
router.get('/user/_id/:_id', userCtrl.findById)
router.get('/user/name/:userName', userCtrl.findByName);
router.delete('/user/_id/:_id', userCtrl.findOneAndRemove);
router.post('/user/:userName/learning/:deck_id', userCtrl.insertLearning);

router.get('/deck/name/:name', deckCtrl.findOne);
router.get('/deck/_id/:_id', deckCtrl.findById);

module.exports = router;