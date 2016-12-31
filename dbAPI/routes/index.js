const router = require('express').Router();
const deckCard = require('./deckCard');
const deck = require('./deck');
const user = require('./user');
const mockData = require('./mockData');

router.use('/deckCard', deckCard);
router.use('/deck', deck);
router.use('/user', user);
router.use('/mockData', mockData);

module.exports = router;