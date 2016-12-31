const router = require('express').Router();
const mockDataCtrl = require('../controllers/mockDataCtrl');

router.get('/', mockDataCtrl.insert);
router.get('/users', mockDataCtrl.insertUsers);
router.get('/decks', mockDataCtrl.insertDecks);

module.exports = router;