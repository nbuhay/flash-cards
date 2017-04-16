const router = require('express').Router();
const userCtrl = require('dbAPI/controllers/userCtrl');

router.route('/')
	.get(userCtrl.findAll)
	.post(userCtrl.create);

router.route('/find')
	.get(userCtrl.findOne)
	.head(userCtrl.findOne);

router.route('/:_id')
	.head(userCtrl.findById)
	.get(userCtrl.findById)
	.put(userCtrl.findByIdAndUpdate)
	// .delete(userCtrl.findOneAndRemove);

router.route('/:user_id/learning/:deck_id')
	.post(userCtrl.saveLearning)
	.put(userCtrl.updateLearning)
	.delete(userCtrl.findByIdAndRemoveLearning);

module.exports = router;