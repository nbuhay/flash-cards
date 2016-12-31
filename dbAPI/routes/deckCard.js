const router = require('express').Router();
const deckCardCtrl = require('../controllers/deckCardCtrl');

router.route('/all')
	.get(deckCardCtrl.findAll);

router.route('/:_id')
	.get(deckCardCtrl.findById);

module.exports = router;