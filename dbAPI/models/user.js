var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	userName: {
		required: true,
		type: String,
		minlength: 2,
		maxlength: 21
	},
	pswd: {
		required: true,
		type: String,
		minlength: 8,
		maxlength: 256
	},
	email: {
		domainId: {
			required: true,
			type: String
		},
		domain: {
			required: true,
			type: String
		},
		extension: {
			required: true,
			type: String
		}
	},
	decks: {
		created: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Deck'		
		}],
		learning: [{
			deck: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Deck'
			},
			userCards: [{
				required: true,
				type: mongoose.Schema.Types.ObjectId,
				ref: 'UserCard'
			}]
		}]
	}
});

userSchema.virtual('emailAddress').get(function() {
	return this.email.domainId + '@' + this.email.domain + '.' + this.email.extension;
});

module.exports = mongoose.model('User', userSchema);
