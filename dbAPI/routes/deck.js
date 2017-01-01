const router = require('express').Router();
const deckCtrl = require('../controllers/deckCtrl');

router.route('/')
	.post(deckCtrl.create);

router.route('/all')
	.get(deckCtrl.findAll);

router.route('/:_id')
	.get(deckCtrl.findById)
	.put(deckCtrl.findByIdAndUpdate)
	.delete(deckCtrl.findOneAndRemove);

module.exports = router;
