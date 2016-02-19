var uuid = require('node-uuid');
var _ = require('lodash');
var twitterAPI = require('node-twitter-api');

var twitter = new twitterAPI({
  consumerKey: 'yrbZG2XOKCgDebGinFDUI4JsW',
  consumerSecret: 'LmiJnLoAvPlIBDX1IpIc1lVYjs2nSGxBAxKj9qtCXdwirDN1zO',
  callback: 'http://127.0.0.1:5000'
});

var db = require('./db.js');
var send = require('./sendMessage.js');
var util = require('./util.js');

/**
 * Receives POST requests from /api/users/new
 *
 * @function
 * @param {object} req Request Parameter from POST Request
 * @param {object} res Response Parameter from POST Request
 * @param {string} req.body.email
 * @param {string} req.body.password
 */
var add = function(req, res) {

  var email = req.body.email;
  var password = req.body.password;

  if(!util.validEmail(email) || !util.validPassword(password, 8)) {
    util.finalizeResponse(true, 'The email and/or password is invalid.', res);
    return;
  }

  util.getUser(res, {email: email}, function(err, result) {
    if(err) {
      console.log('Error retrieving user: ', err);
      util.finalizeResponse(true, 'There was an error adding your email to the database.', res);
      return
    }

    console.log('Empty Result: ', _.isEmpty(result));

    if(!_.isEmpty(result)) {
      util.finalizeResponse(true, 'This email already exists in our database.', res);
      return;
    }

    var userDetails = {
      email: email, 
      password: password
    };
    util.saltAndHashPassword(res, userDetails, addUser);       
  });
};

/**
 * Add User to Database
 *
 * @function
 * @param {object} err Error object
 * @param {string} errMessage Error message to use in response
 * @param {object} res Response parameter from request
 * @param {object} userDetails User details to create db entry
 * @param {function} callback Function to exectute on error/success
 */
var addUser = function(err, errMessage, res, userDetails, callback) {
  callback = callback || util.finalizeResponse;

  if(err) {
    callback(err, errMessage, res)
    return;
  }

  userDetails.active = 0;

  db.users.insert(userDetails, function(err, newDoc) {
    if(err) {
      var errMessage = 'There was a problem adding this user to the database';
      callback(err, errMessage, res);
      return;
    }

    addActivationCode(newDoc._id, userDetails.email);
    callback(null, null, res, newDoc);
  });
};

/**
 * Creates activation code necessary to activate user and sends confirmation email to user
 *
 * @function
 * @param {string} userId User ID corresponding to new user
 * @param {string} email Email address of new user
 */
var addActivationCode = function(userId, email) {
  var codeDetails = {
    activationCode: uuid.v1(),
    userId: userId
  };

  db.activationCodes.insert(codeDetails, function(err, newDoc) {
    if(err) {
      console.log('Error Inserting User', err);
      return;
    }
    
    var messageDetails = {
      activationCode: codeDetails.activationCode,
      email: email
    }
    send.sendMessage('activate', email, messageDetails);    
  });
};

/**
 * Updates user to active after activation code URL has been visited
 *
 * @function
 * @param {object} req Request Parameter from PUT Request
 * @param {object} res Response Parameter from PUT Request
 * @param {string} req.body.code Activation Code
 */
var activate = function(req, res) {
  console.log(req.body.code);
  if(!req.body.code) {
    util.finalizeResponse(true, 'No activation code in request.', res);
    return;
  }
  
  getActivationCode(res, req.body.code);
};

/**
 * Get activation code from database
 *
 * @function
 * @param {object} res Response Object
 * @param {string} req.body.code Activation Code
 */
var getActivationCode = function(res, code) {
 db.activationCodes.find({ activationCode: code }, function (err, docs) {
    if(err) {
      var errMessage = 'There was a problem finding this user';
      console.log('Error Retrieving User: ', err);
      activateUser(err, errMessage, res, null, util.finalizeResponse);
      return;
    }

    util.getUser(res, {_id: docs[0].userId}, function(err, user) {
      if(err) {
        util.finalizeResponse(true, 'There was an error activating this user.', res);
        return;
      }

      if(_.isEmpty(user)) {
        util.finalizeResponse(true, 'There was a problem finding this user.', res);
        return;
      }

      var userDetails = {
        userId: user._id,
        email: user.email
      };
      activateUser(null, null, res, userDetails, util.finalizeResponse);      
    });
  });
};

/**
 * Activate User in Database
 *
 * @function
 * @param {object} err Error object
 * @param {string} errMessage Error message to use in response
 * @param {object} res Response parameter from request
 * @param {object} userDetails User details to create db entry
 * @param {function} callback Function to exectute on error/success
 */
var activateUser = function(err, errMessage, res, userDetails, callback) {
  if(err) {
    callback(err, errMessage, res);
    return;
  }

  db.users.update({ _id: userDetails.userId }, {$set: { active: 1}}, { multi: true }, function (err, numReplaced) {
    if(err) {
      var errMessage = 'There was a problem activating this user';      
      callback(err, errMessage, res);
      console.log('Error Updating Password', err);
      return;
    }
    send.sendMessage('welcome', userDetails.email);
    callback(null, null, res);    
  });
};

/**
 * Get request token from Twitter API
 *
 * @function
 * @param {object} res Response Object
 * @param {string} req.body.code Activation Code
 */
var getTwitterRequestToken = function(req, res) {
  twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
    if (error) {
      console.log("Error getting OAuth request token : " + error);
    } else {
      console.log(results);
      var twRedirect = 'https://twitter.com/oauth/authenticate?oauth_token=' + requestToken;
      util.finalizeResponse(null, null, res, {redirectURL: twRedirect});
      //store token and tokenSecret somewhere, you'll need them later; redirect user 
    }
  });
};

module.exports = {
  add: add,
  activate: activate,
  getTwitterRequestToken: getTwitterRequestToken
};