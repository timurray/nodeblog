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
					//if found need to redirect to user's blog page	
					return;
				}
		});
	});
});

router.get('/myblog', function(req, res) {
	
});

/*router.get('/blog/:userName', function(req, res) {
	//THIS WILL BRING UP THE BLOG FOR THAT USER, TO VIEW IT NOT EDIT IT
});*/

router.get('/register', function(req, res) {
	res.sendFile('pages/register.html', {root: __dirname });
});

router.post('/registered', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var username = req.body.username;
	
	if(email === '' || password === '' || username === ''){
		res.send('One or more fields were left blank' + '<br>' + '<a href="/register">Back to Register screen</a>');
	}
	else{
		db.serialize(function() {
			db.get("SELECT u.* FROM users u WHERE u.username = '" + username + "'", function(err, row){
				if(row == undefined || row === []) {
					db.run("INSERT INTO users (email, password, username) VALUES ('" + email + "','" + password + "','" + username + "')");
					res.send("User registered with the following info: " + "<br>" + email + "<br>" + username + "<br>" + "<a href='/'>Back to log in screen</a>");
				}
				else{
					res.send('That username or email has already been registered' + '<br>' + '<a href="/register">Back to Register screen</a>');
				}
			});
		});
	}
});


module.exports = router;