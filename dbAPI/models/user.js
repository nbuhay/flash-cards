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
		type: String
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
	zip: {
		code: {
			required: true,
			type: Number,
			min: 5,
			max: 5
		},
		plusFour: {
			type: Number,
			min: 4,
			max: 4
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

userSchema.virtual('zipPlusFour').get(function () {
	return this.zip.code + '-' + this.zip.plusFour;
});

userSchema.virtual('emailAddress').get(function () {
	return this.email.domainId + '@' + this.email.domain + '.' + this.email.extension;
});

module.exports = mongoose.model('User', userSchema);
