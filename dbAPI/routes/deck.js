const router = require('express').Router();
const deckCtrl = require('dbAPI/controllers/deckCtrl');

router.route('/')
	.post(deckCtrl.create);

router.route('/all')
	.get(deckCtrl.findAll);

router.route('/:_id')
	.get(deckCtrl.findById)
	.put(deckCtrl.findByIdAndUpdate)
	.delete(deckCtrl.findByIdAndRemove);

module.exports = router;
