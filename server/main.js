var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

router.get('/', function(req, res) {
	res.sendFile('pages/index.html', {root: __dirname });
});

router.post('/userpage', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	
});
module.exports = router;