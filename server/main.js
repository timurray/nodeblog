var express = require('express');
var bodyParser = require('body-parser');
var sqlite = require('sqlite3').verbose();
var router = express.Router();

var db = new sqlite.Database("blog.db");

router.get('/', function(req, res) {
	res.sendFile('pages/index.html', {root: __dirname });
});

router.post('/userpage', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var found_user = false;
	
	db.serialize(function() {
		db.each("SELECT u.* FROM users u WHERE u.email = '" + email + "' AND u.password = '" + password + "'", function(err, row) {
				console.log(email);
				console.log(password);
				console.log(err);
				if(err || row == undefined || row === []){
					console.log("Invalid credentials");
					res.write('<h1>Invalid Credientials</h1>\n<a href="/">Back to log in screen</a>');
				}
				else{
					console.log("we here");
					found_user = true;	
					res.send("yo u signed in my bro");	
					return;
				}
		});
	});
});

router.get('/register', function(req, res) {
	res.sendFile('pages/register.html', {root: __dirname });
});

router.post('/registered', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var username = req.body.username;
	
	db.serialize(function(err) {
		console.log(err);
		db.run("INSERT INTO users (email, password, username) VALUES ('" + email + "','" + password + "','" + username + "')");
	});
	
	res.send("User registered with the following info: " + "<br>" + email + "<br>" + username);
});


module.exports = router;