var express = require('express');
var bodyParser = require('body-parser');
var compress = require('compression');

var authUser = require('./api/auth.js');
var addUser = require('./api/addUser.js');
var changePassword = require('./api/changePassword.js');
var util = require('./api/util.js');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compress());

// Allow CORS
app.use('/', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Specify Static Content Folder
app.use('/', express.static(__dirname + '/client'));

// Endpoints
app.post('/api/user/new', addUser.add);
app.post('/api/auth', authUser.auth);
app.post('/api/resetCode/new', changePassword.getResetCode);
app.put('/api/activate', addUser.activate);
app.put('/api/changePassword', changePassword.changePassword);
app.get('/api/twitter/getToken', addUser.getTwitterRequestToken);

// Client Side Routes
app.get('/signup', function(req, res) {
  serveHTML(req, res, 'index.html');
});

app.get('/login', function(req, res) {
  serveHTML(req, res, 'login.html');
});

app.get('/activate*', function(req, res) {
  serveHTML(req, res, 'activate.html');
});

app.get('/resetCode', function(req, res) {
  serveHTML(req, res, 'resetCode.html');
});

app.get('/reset*', function(req, res) {
  serveHTML(req, res, 'reset.html');
});

app.get('/', function(req, res) {
  serveHTML(req, res, 'index.html');
});

/**
 * Serve specified HTML file
 *
 * @function
 * @param {object} req Request parameter from request
 * @param {object} res Response parameter from request
 * @param {string} fileToServe name of HTML file to send to client
 * @returns {html} Sends client the specified HTML file
 */
var serveHTML = function(req, res, fileToServe){
  var options = {
    root: __dirname + '/client',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  res.sendFile(fileToServe, options, function(err) {
    if(err) {
      console.log(err, 'Failed to serve html');
      res.status(err.status || 500).end();
    }
  });
};

var port = 5000;
console.log('Listening on port...' + port);
app.listen(port);

