'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');

const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "pug");

app.route('/')
  .get((req, res) => {
    res.render("pug/index.pug", {title: "Hello", message: "Please login"});
  });

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Listening on port " + port + "!");
});
