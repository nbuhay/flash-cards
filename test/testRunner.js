process.env.NODE_ENV='test';
const assert = require('assert');
const server = require('bin/www').server();
const mongoose = require('mongoose');
const errHeader = require('modules/errorHeader')(__filename);

function importTest(name, path) {
  describe(name, () => require(path));
}

describe('MochaRunner', () => {
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

	describe('Testing Libraries Available', () => {
		it('chai', () => assert.ok(require('chai')));
		it('chai-as-promised', () => assert.ok(require('chai-as-promised')));
		it('istanbul', () => assert.ok(require('istanbul')));
		it('sinon', () => assert.ok(require('sinon')));
		it('sinon-as-promised', () => assert.ok(require('sinon-as-promised')));
		it('nock', () => assert.ok(require('nock')));
	});

	describe('Unit', () => {

		describe('modules', () => {
			importTest('', './modules/errorHeader');
			importTest('', './modules/jsonRequest');
			importTest('', './modules/jsonResponse');
		});

		describe('dbAPI', () => {
			describe('modules', () => {
				describe('validate', () => {
					importTest('', './dbAPI/unit/modules/validate/mongoId');
					importTest('', './dbAPI/unit/modules/validate/req');
					importTest('', './dbAPI/unit/modules/validate/stringArray');
					importTest('', './dbAPI/unit/modules/validate/deckCard');
				});
			});

			describe('controllers', () => {
				importTest('', './dbAPI/unit/controllers/deckCardCtrl');
				importTest('', './dbAPI/unit/controllers/deckCtrl');
				importTest('', './dbAPI/unit/controllers/userCtrl');
				importTest('', './dbAPI/unit/controllers/userCardCtrl');
			});

		});

	});

	describe('Integration', () => {

		describe('dbAPI', () => {
			
			describe('routes', () => {
				importTest('', './dbAPI/integration/controllers/deckCardCtrl');
				importTest('', './dbAPI/integration/controllers/userCtrl');
			});

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