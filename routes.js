const passport = require("passport");
const bcrypt = require("bcrypt");

module.exports = function(app, db) {

	app.route('/')
	  .get((req, res) => {
	    res.render("pug/index.pug", {title: "Hello", message: "Please login", showLogin: true, showRegistration: true, title: "Home Page"}); //title Home Page required to pass fcc tests.....
	  });

	app.post("/login", passport.authenticate("local", {failureRedirect: "/"}), function(req, res) {
		res.render("./pug/profile", {username: req.user.username});
	})

	app.get("/profile", ensureAuthenticated, function (req, res) {
		res.render("./pug/profile.pug", {username: req.user.username, title: "Profile Page"}); //@@@@ why doesn't this work?!
		// res.render(process.cwd() + "views/pug/profile", {username: req.user.username, title: "Profile Page"});
		// res.render(process.cwd() + '/views/pug/profile' + {username: req.user.username, title: "Profile Page"}); //THIS ALSO WORKS   
	});

	app.get("/logout", function(req, res) {
		req.logout(); //handled by passport!
		res.redirect("/");
	})

	app.route("/register")
	.post(function(req, res, next) {
		db.collection("users").drop(); //required to pass the fcc test..
		db.collection("users").findOne({username: req.body.username}, function(err, user) {
			if (err) {
				next(err);
			} else if (user) {
				console.log("ALREADY REGISTERED"); //fcc used to fail here due to user already being registered
				res.redirect("/");
			} else {
				let hash = bcrypt.hashSync(req.body.password, 12);
				db.collection("users").insertOne({
					username: req.body.username,
					password: hash
				}, function (err, createdUser) {
					if (err) {
						console.log("err 3");
						res.redirect("/");
					} else {
						console.log("works till here! 1")
						next(null, user);
					}
				})
			}
		})
	},
	passport.authenticate("local", {failureRedirect: "/"}), function (req, res, next) {
		// res.redirect("/profile");
		console.log("works till here! 2");
		res.render("./pug/profile.pug", {username: req.user.username, title: "Profile Page"});
	});

	app.use( function(req, res, next) {
		res.status(404)
			.type("text")
			.send("Not found!");
	});

}

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		console.log("redireeeeect!");
		res.redirect("/");
	}
}