process.env.NODE_ENV='test';
const assert = require('assert');
const server = require('../bin/www').server();
const mongoose = require('mongoose');
const errHeader = require('../modules/errorHeader')(__filename);

function importTest(name, path) {
  describe(name, () => require(path));
}

describe('Mocha Test Runner', () => {
	before((done) => {
		
		console.log('   Bootstraping Test Env');
		console.log('\tstarting up the server...');
		// start webserver
		require('../bin/www');
		console.log('\tserver is up and running');
		// db ceremony...
		// make sure connection is established
		mongoose.connection.once('connected', () => {
			return new Promise((resolve, reject) => {
				// cleanse the db
				mongoose.connection.db.dropDatabase(() => {
					console.log('\tmongoose.connection.db.dropDatabase: success');
					done();
				});
			})
			.catch((reason) => console.log('%sbefore: %s', errHeader, reason));
		});
	});

	describe('Testing Env Canaries', () => {

		it('should ensure Chai Assertion Libraries are installed', () =>{
			assert.ok(require('chai'));
		});

		it('should ensure Chai Assert Library is available', () => {
			assert.ok(require('chai').assert);
		});

	});

	describe('Unit Tests', () => {

		describe.only('./modules/', () => {
			importTest('', './modules/errorHeader');
			importTest('', './modules/jsonRequest');
			importTest('', './modules/jsonResponse');
		});

		describe('./dbAPI/controllers/', () => {
			importTest('', './dbAPI/unit/controllers/deckCardCtrl');
			importTest('', './dbAPI/unit/controllers/deckCtrl');
		});

	});

	describe('Integration Tests', () => {

		describe('dbAPI Routes', () => {
			importTest('', './dbAPI/integration/controllers/deckCardCtrl');
		});

	});
	// importTest('', './dbAPI/controllers/deckCtrl');
	// importTest('', './dbAPI/controllers/userCtrl');
	// importTest('', './webserver/controllers/deckCtrl');
	// importTest('', './webserver/controllers/indexCtrl');
	
	after(() => {		
		console.log('   After Tests');
		console.log('\tattempting server shutdown...');
		server.close((err, data) => {
			(err) ? console.log('%safter: %s', errHeader, err)
			: console.log('\tserver shutdown successfully');
		});
	});
});