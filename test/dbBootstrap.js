const mongoose = require('mongoose');
const mockDeckCards = require('config').mockDeckCards();
const mockDecks = require('config').mockDecks();
const mockUsers = require('config').mockUsers();
const errHeader = require('modules/errorHeader')(__filename);

function before() {
	console.log('\tBefore Tests');
	// db ceremony...
		return new Promise((resolve, reject) => {
			// cleanse the db
			mongoose.connection.db.dropDatabase(() => {
				console.log('\tmongoose.connection.db.dropDatabase: success');
				resolve();
			});
		})
		.then(() => {
			return new Promise((resolve, reject) => {
				// mockDeckCards[i]._id casted to Mongo ObjectId type
				for (var i = 0; i < mockDeckCards.length; i++) {
					mockDeckCards[i]._id = mongoose.Types.ObjectId(mockDeckCards[i]._id);
				}
				// insert the deckCard collection
				mongoose.connection.collection('deckcards').insert(mockDeckCards, (err, users) => {
					if (err) reject('mongoose.connection.collection(\'deckcards\').insert: ' + err);
					console.log('\tmongoose.connection.collection(\'deckcards\').insertedCount: %s', users.insertedCount);
					resolve();
				});
			});
		})
		.then(() => {
			return new Promise((resolve, reject) => {
				// mockUsers[i]._id casted to Mongo ObjectId type
				for (var i = 0; i < mockUsers.length; i++) {
					mockUsers[i]._id = mongoose.Types.ObjectId(mockUsers[i]._id);
				}
				// insert the user collection
				mongoose.connection.collection('users').insert(mockUsers, (err, users) => {
					if (err) reject('mongoose.connection.collection(\'users\').insert: ' + err);
					console.log('\tmongoose.connection.collection(\'users\').insertedCount: %s', users.insertedCount);
					resolve();
				});
			});
		})
		.then(() => {
			return new Promise((resolve, reject) => {
				// mockDecks[i]._id casted to Mongo ObjectId type
				for (var i = 0; i < mockDecks.length; i++) {
					mockDecks[i]._id = mongoose.Types.ObjectId(mockDecks[i]._id);
				}
				// insert the deck collection
				mongoose.connection.collection('decks').insert(mockDecks, (err, decks) => {
					if (err) reject('mongoose.connection.collection(\'decks\').insert:error: ' + err);
					console.log('\tmongoose.connection.collection(\'decks\').insertedCount: %s', decks.insertedCount);
					resolve();
				});
			});
		})
		.catch((reason) => console.log('\t%sbefore.%s', errorHeader, reason));
}

function beforeEach() {
	return new Promise((resolve, reject) => {
		// cleanse the db
		mongoose.connection.db.dropDatabase(() => {
			resolve();
		});
	})
	.then(() => {
		return new Promise((resolve, reject) => {
			// insert the deckCard collection
			mongoose.connection.collection('deckcards').insert(mockDeckCards, (err) => {
				if (err) reject(err);
				resolve();
			});
		})
	})
	.then(() => {
		return new Promise((resolve, reject) => {
			// insert the deck collection
			mongoose.connection.collection('decks').insert(mockDecks, (err) => {
				if (err) reject(err);
				resolve();
			});
		})
	})
	.then(() => {
		return new Promise ((resolve, reject) => {
			// insert the user collection
			mongoose.connection.collection('users').insert(mockUsers, (err) => {
				if (err) reject(err);
				resolve();
			});
		});
	})
	.catch((reason) => console.log('\t%sbefore.%s', errorHeader, reason));
}

module.exports = {
	before,
	beforeEach
}