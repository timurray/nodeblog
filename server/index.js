var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");

var server = express();
server.use(express.static(__dirname + '/public'));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser());
server.set('views', 'views')
server.set('view engine', 'pug');

//all new routes go after this line
//ex: var main = require('./main');
var main = require('./main');

//ex: server.use('./main', main);
server.use('/', main);

var port = 8081;
server.listen(port, function() {
	console.log('server listening on port: ' + port);
});