'use strict';

const express     	= require('express');
const bodyParser  	= require('body-parser');
const fccTesting  	= require('./freeCodeCamp/fcctesting.js');
const session 			= require("express-session");
const passport 			= require("passport");
// const ObjectID    	= require('mongodb').ObjectID;
const mongo       	= require('mongodb').MongoClient;
// const LocalStrategy = require("passport-local");
// const bcrypt				= require("bcrypt");

const app = express();

const routes = require("./routes.js");
const auth = require("./auth.js");

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
		auth(app, db);
		routes(app, db);

		let port = process.env.PORT || 3000;
		app.listen(port, () => {
		  console.log("Listening on port " + port + "!");
		});
	}
});