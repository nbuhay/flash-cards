process.env.NODE_ENV='test';
const assert = require('assert');
const server = require('bin/www').server();
const mongoose = require('mongoose');
const errHeader = require('modules/errorHeader')(__filename);

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

		it('should ensure chai is available', () =>{
			assert.ok(require('chai'));
		});

		it('should ensure chai-as-promised is available', () =>{
			assert.ok(require('chai-as-promised'));
		});		

		it('should ensure istanbul is available', () => {
			assert.ok(require('istanbul'));
		});

		it('should ensure sinon is available', () =>{
			assert.ok(require('sinon'));
		});
		
		it('should ensure sinon-as-promised is available', () =>{
			assert.ok(require('sinon-as-promised'));
		});

		it('should ensure nock is available', () =>{
			assert.ok(require('nock'));
		});

	});

	describe('Unit Tests', () => {

		describe('./modules/', () => {
			importTest('', './modules/errorHeader');
			importTest('', './modules/jsonRequest');
			importTest('', './modules/jsonResponse');
		});

		describe('./dbAPI/controllers/', () => {
			importTest('', './dbAPI/unit/controllers/deckCardCtrl');
			importTest('', './dbAPI/unit/controllers/deckCtrl');
			importTest('', './dbAPI/unit/controllers/userCtrl');
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