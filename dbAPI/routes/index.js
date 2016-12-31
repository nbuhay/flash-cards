var express = require('express');
var router = express.Router();
var mockDataCtrl = require('../controllers/mockDataCtrl');
var deckCardCtrl = require('../controllers/deckCardCtrl');
var deckCtrl = require('../controllers/deckCtrl');
var userCtrl = require('../controllers/userCtrl');

router.get('/deckCards', deckCardCtrl.findAll);

router.get('/mockData', mockDataCtrl.insert);
router.get('/mockData/users', mockDataCtrl.insertUsers);
router.get('/mockData/decks', mockDataCtrl.insertDecks);

router.get('/users', userCtrl.findAll);
router.post('/user', userCtrl.save);
router.get('/user/_id/:_id', userCtrl.findById);
router.put('/user/_id/:_id', userCtrl.findByIdAndUpdate);
router.get('/user/name/:userName', userCtrl.findByName);
router.delete('/user/_id/:_id', userCtrl.findOneAndRemove);
router.post('/user/_id/:user_id/learning/deck/_id/:deck_id', userCtrl.saveLearning);
router.delete('/user/_id/:user_id/learning/deck/_id/:deck_id', userCtrl.findByIdAndRemoveLearning);
router.put('/user/_id/:user_id/learning/deck/_id/:deck_id', userCtrl.findByIdAndUpdateLearning);

router.get('/decks', deckCtrl.findAll);
router.post('/deck', deckCtrl.create);
router.get('/deck/_id/:_id', deckCtrl.findById);
router.put('/deck/_id/:_id', deckCtrl.findByIdAndUpdate);
router.delete('/deck/_id/:_id', deckCtrl.findOneAndRemove);

module.exports = router;