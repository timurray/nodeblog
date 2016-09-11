var express = require('express');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var sqlite = require('sqlite3').verbose();
var router = express.Router();

var db = new sqlite.Database("blog.db");

router.get('/', function(req, res) {	
	if(req.cookies.uuid) {
		db.serialize(function() {
			db.get("SELECT uid FROM sessionTokens WHERE token='" + req.cookies.uuid + "'", function(err, row) {
				res.redirect('/' + row.uid);
			});
		});
	}
	else {
		res.sendFile('pages/index.html', {root: __dirname });
	}
});

router.post('/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	
	db.serialize(function() {
		db.get("SELECT u.* FROM users u WHERE u.email = '" + email + "' AND u.password = '" + password + "'", function(err, row) {
				console.log(email);
				console.log(password);
				console.log(err);
				if(err || row === undefined || row === []){
					console.log("Invalid credentials");
					res.send('<h1>Invalid Credientials</h1>\n<a href="/">Back to log in screen</a>');
				}
				else{
					console.log("we here");	
					token = crypto.randomBytes(128).toString('hex');
					res.cookie('uuid', token, {expires: new Date(Date.now() + 9999999)});
					
					//adds session to database
					db.run("INSERT OR REPLACE INTO sessionTokens (uid, token) VALUES ((SELECT username FROM users WHERE email ='"+ email + "'), '" + token + "')");
					
					var uname = row.username;
					console.log(uname);
					
					//redirects to user's blog page
					res.redirect('/blog/' + uname);
					
					return;
				}
		});
	});
});

router.get('/logout/:userName', function(req, res) {
	var username = req.params.userName;
	console.log(username);
	db.serialize(function(err) {
		db.run("DELETE FROM sessionTokens WHERE uid= '" + username + "'");
	});
	res.clearCookie('uuid');
	console.log('logout success');
	res.redirect('/');
});

router.get('/blog/:userName', function(req, res) {
	var username = req.params.userName;
	var userExists = false;

	db.serialize(function() {
		db.each("SELECT * FROM users WHERE username='" + username + "'", function(err, row) {
			if(err){
				console.log(err);
			}
			if(row !== undefined || row !== []){
				userExists = true;
			}
			
		}, function() {
			console.log(req.cookies.uuid);
		   	if(req.cookies.uuid) {
				//need to index the sessions and compare those instead of the entire string
				db.each("SELECT uid FROM sessionTokens WHERE token='" + req.cookies.uuid + "'", function(err, row) {
					console.log(row);
					if(row.uid === username){
						console.log(req.cookies.uuid);
						
						var posts = [];
						var i = 0;
						
						db.each("SELECT b.* FROM blogpost b, users u WHERE b.uid=u.user_id AND u.username='" + username + "' ORDER BY date DESC LIMIT 3", function(err, row) {
							console.log(err);
							console.log(row.title + '\n' + row.date + '\n' + row.body + '\n');
        					posts[i] = new Object();
       						posts[i].title = row.title;
        					posts[i].date = row.date;
        					posts[i].body = row.body;
    						
    						console.log(posts[i].title);
    						i++;
    						
    						if(i === 3) {
    							res.render('blog', {userBlog: 'Welcome to your blog', user: username, lastPostTitle: posts[0].title, lastDate: posts[0].date, lastPostBody: posts[0].body, secLastTitle: posts[1].title, secDate: posts[1].date, secLastBody: posts[1].body, thirdLastTitle: posts[2].title, thirdDate: posts[2].date, thirdLastBody: posts[2].body, pretty: true});
    						}
						});
						
						console.log(posts.length);
					}
					else if(!userExists){
						res.send("this blog does not exist");
					}
					else {
						res.send('you can view but not edit');
						// LOAD VIEW BLOG HTML PAGE
					}
				});
			}
			else if(!userExists){
				res.send("this blog does not exist no session");
			}
			else{
				res.send('you can view but not edit, no session token version');
			}
		});
	});
});


router.post('/post/:userName', function(req, res) {
	
});


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
				if(row === undefined || row === []) {
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