'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const session 		= require("express-session");
const passport 		= require("passport");
const mongo				= require("mongodb");

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

passport.serializeUser( function(user, done) {
	done(null, user._id);
})
passport.deserializeUser( function(id, done) {
	// db.collection("users").findOne({_id: new ObjectID(id)}, function (err, doc) {
		done(null, null);
	// });
});

app.route('/')
  .get((req, res) => {
    res.render("pug/index.pug", {title: "Hello", message: "Please login"});
  });

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Listening on port " + port + "!");
});
