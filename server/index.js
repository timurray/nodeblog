var express = require('express');
var bodyParser = require('body-parser');

var server = express();
server.use(express.static(__dirname + '/public'));
server.use(bodyParser.urlencoded({ extended: true }));

//all new routes go after this line
//ex: var main = require('./main');
var main = require('./main');

//ex: server.use('./main', main);
server.use('/', main);

var port = 8081;
server.listen(port, function() {
	console.log('server listening on port: ' + port);
});