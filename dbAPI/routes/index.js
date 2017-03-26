const router = require('express').Router();
const deckCard = require('./deckCard');
const deck = require('./deck');
const user = require('./user');

router.use('/deckCard', deckCard);
router.use('/deck', deck);
router.use('/user', user);

module.exports = router;