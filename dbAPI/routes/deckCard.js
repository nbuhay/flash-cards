const router = require('express').Router();
const deckCardCtrl = require('../controllers/deckCardCtrl');

router.route('/')
	.get(deckCardCtrl.findAll);

module.exports = router;