const router = require('express').Router();
const deckCtrl = require('../controllers/deckCtrl');

router.route('/')
	.get(deckCtrl.findAll)
	.post(deckCtrl.create);

router.route('/_id/:_id')
	.get(deckCtrl.findById)
	.put(deckCtrl.findByIdAndUpdate)
	.delete(deckCtrl.findOneAndRemove);

module.exports = router;
