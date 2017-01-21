const router = require('express').Router();
const userCtrl = require('../controllers/userCtrl');

router.route('/')
	.get(userCtrl.findAll)
	.post(userCtrl.create);

router.route('/:_id')
	.head(userCtrl.findById)
	.get(userCtrl.findById)
	.put(userCtrl.findByIdAndUpdate)
	.delete(userCtrl.findOneAndRemove);

router.route('/_id/:user_id/learning/deck/_id/:deck_id')
	.post(userCtrl.saveLearning)
	.put(userCtrl.findByIdAndUpdateLearning)
	.delete(userCtrl.findByIdAndRemoveLearning);

module.exports = router;