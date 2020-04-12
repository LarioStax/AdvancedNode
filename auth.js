const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const ObjectID    	= require('mongodb').ObjectID;

module.exports = function(app, db) {

	passport.serializeUser( function(user, done) {
		done(null, user._id);
	})

	passport.deserializeUser( function(id, done) {
		db.collection("users").findOne({_id: new ObjectID(id)}, function (err, doc) {
			if (err) {
				console.log(err)
			} else {
				done(null, doc);
			}
		});
	});

	//AUTHENTICATION STRATEGY
	passport.use(new LocalStrategy( function(username, password, done) {
		db.collection("users").findOne({username: username }, function( err, user) {
			console.log("User " + username + " attempted to log in.");
			if (err) {
				return done(err);
			} else if (!user) {
				return done(null, false);
			} else if (!bcrypt.compareSync(password, user.password)) {
				return done(null, false);
			} else {
				return done(null, user);
			}
		})
	}))
	
}