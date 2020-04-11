'use strict';

const express     	= require('express');
const bodyParser  	= require('body-parser');
const fccTesting  	= require('./freeCodeCamp/fcctesting.js');
const session 			= require("express-session");
const passport 			= require("passport");
const ObjectID    	= require('mongodb').ObjectID;
const mongo       	= require('mongodb').MongoClient;
const LocalStrategy = require("passport-local");


const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "pug");

mongo.connect(process.env.DATABASE, function(err, db) {
	if (err) {
		console.log(err);
	} else {
		console.log("Connected to database!")

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
				} else if (password !== user.password) {
					return done(null, false);
				} else {
					return done(null, user);
				}
			})
		}))

		app.route('/')
		  .get((req, res) => {
		    res.render("pug/index.pug", {title: "Hello", message: "Please login", showLogin: true, title: "Home Page"}); //title Home Page required to pass fcc tests.....
		  });

		app.post("/login", passport.authenticate("local", {failureRedirect: "/"}), function(req, res) {
			res.render("pug/profile.pug");
		})

		app.get("/profile", ensureAuthenticated, function (req, res) {
			// res.render("pug/profile.pug", {username: req.user.username}); //@@@@ why doesn't this work?!
			res.render(process.cwd() + "views/pug/profile", {username: req.user.username});
			// res.render(process.cwd() + '/views/pug/profile' + {username: req.user.username}); //THIS ALSO WORKS   
		});

		app.get("/logout", function(req, res) {
			req.logout(); //handled by passport!
			res.redirect("/");
		})

		app.use( function(req, res, next) {
			res.status(404)
				.type("text")
				.send("Not found!");
		})

		let port = process.env.PORT || 3000;
		app.listen(port, () => {
		  console.log("Listening on port " + port + "!");
		});
	}
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		console.log("redireeeeect!");
		res.redirect("/");
	}
}