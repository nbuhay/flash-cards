const server = require('../bin/www').server();
const mongoose = require('mongoose');

function importTest(name, path) {
  describe(name, () => require(path));
}

describe('Runner', () => {
	before((done) => {
		console.log('    Before Tests');
		// start webserver
		require('../bin/www');
		// db ceremony...
		// make sure connection is established
		mongoose.connection.once('connected', () => {
			var promise = new Promise((resolve, reject) => {
				// cleanse the db
				mongoose.connection.db.dropDatabase(() => {
					console.log('\tmongoose.connection.db.dropDatabase: success');
					done();
				});
			})
			.catch((reason) => console.log('error:before.%s', reason));
		});
	});

	importTest('', './dbAPI/controllers/deck');	
	importTest('', './dbAPI/controllers/user');	
	
	after(() => {		
		console.log('   After Tests');
		console.log('\tClosing server...');
		server.close((err, data) => (err) ? console.log('Error:' + err) : console.log('\tServer Closed'));		
	});
});