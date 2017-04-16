const mongoose = require('mongoose');
const mockDeckCards = require('config').mockDeckCards();
const mockDecks = require('config').mockDecks();
const mockUsers = require('config').mockUsers();
const mockUserCards = require('config').mockUserCards();
const errHeader = require('modules/errorHeader')(__filename);

function cleanseDb() {
	return new Promise((resolve, reject) => {
		mongoose.connection.db.dropDatabase(() => {
			resolve();
		});
	});
}

function insertMockData(tableName, data) {
	return new Promise((resolve, reject) => {
		// insert the data
		mongoose.connection.collection(tableName).insert(data, (err) => {
			if (err) reject(err);
			resolve();
		});
	});
}

function before() {
	console.log('\tBefore Each Test...');
	console.log('\tmongoose.connection.db.dropDatabase');
	return cleanseDb()
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
		.then(() => {
			return new Promise((resolve, reject) => {
				// cast mockUserCards[i]._id to Mongo ObjectId
				for (var i = 0; i < mockUserCards.length; i++) {
					mockUserCards[i]._id = mongoose.Types.ObjectId(mockUserCards[i]._id);
					mockUserCards[i].deckCard = mongoose.Types.ObjectId(mockUserCards[i].deckCard);
				}
				// insert the userCard collection
				mongoose.connection.collection('userCards').insert(mockDecks, (err, userCards) => {
					if (err) reject('mongoose.connection.collection(\'usercards\').insert: error: ' + err);
					console.log('\tmongoose.connection.collection(\'usercards\').insertedCount: %s', userCards.insertedCount);
					resolve();
				});
			});
		})
		.catch((reason) => console.log('\t%sbefore.%s', errorHeader, reason));
}

function beforeEach() {
	return cleanseDb()
		.then(() => insertMockData('deckcards', mockDeckCards))
		.then(() => insertMockData('usercards', mockUserCards))
		.then(() => insertMockData('decks', mockDecks))
		.then(() => insertMockData('users', mockUsers))
		.catch((reason) => console.log('\t%sbefore.%s', errorHeader, reason));
}

module.exports = {
	before,
	beforeEach
}