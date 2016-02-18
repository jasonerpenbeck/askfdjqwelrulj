var bcrypt = require('bcrypt');
var _ = require('lodash');

var db = require('./db.js');

/**
 * Performs basic validation on an e-mail address
 *
 * @function
 * @param {string} email E-mail address
 * @returns {boolean} Returns a boolean after RegEx validation on e-mail is performed
 */
var validEmail = function(email) {
  var emailRegEx = new RegExp('[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}');
  return emailRegEx.test(email);
};

/**
 * Performs basic validation on a password
 *
 * @function
 * @param {string} password Input Password
 * @param {number} minLength Minimum allowable length of password
 * @returns {boolean} Returns a boolean after variable type and string length validation on password is performed
 */
var validPassword = function(password, minLength) {
  return (typeof password === 'string' && password.length >=minLength);
};

/**
 * Get User Details
 *
 * @function
 * @param {object} res Response parameter from request
 * @param {object} userLookup Identifier to use to lookup user (can be email or _id)
 * @param {function} Callback to exectute on error/success
 */
var getUser = function(res, userLookup, callback) {
  var identifier = (!!userLookup.email) ? {email: userLookup.email} : {_id: userLookup._id};
  console.log('Ident: ', identifier);
  db.users.find(identifier, function(err, results) {
    if(err) {
      console.log('Error Retrieving User: ', err);
      callback(err, null);      
      return;
    }

    var currentUser = (results.length === 0) ? {} : _.last(results);

    console.log('Users with Provided Identifier: ', currentUser);
    callback(null, currentUser);
  });
};

/**
 * Create Salt and Hash Password
 *
 * @function
 * @param {object} res Response parameter from request
 * @param {object} userDetails User details
 * @param {function} Callback to exectute on error/success
 */
var saltAndHashPassword = function(res, userDetails, callback) {
  createSalt(res, userDetails, callback)
};

/**
 * Create Salt
 *
 * @function
 * @param {object} res Response parameter from request
 * @param {object} userDetails User details
 * @param {function} Callback to exectute on error/success
 */
var createSalt = function(res, userDetails, callback) {
  bcrypt.genSalt(8, function (err, salt) {
    if(err) {
      var errorMessage = 'There was a creating a salt for this account. :(';
      hashPassword(err, errorMessage, res);
      return;
    }

    userDetails.salt = salt;
    hashPassword(null, null, res, userDetails, callback) 
  });
};    

/**
 * Hash Password
 *
 * @function
 * @param {object} err Error object
 * @param {string} errMessage Error message to use in response 
 * @param {object} res Response parameter from request
 * @param {object} userDetails User details
 * @param {function} Callback to exectute on error/success
 */
var hashPassword = function(err, errMessage, res, userDetails, callback) {
  if(err) {
    callback(err, errMessage, res, null);
    return;
  }

  bcrypt.hash(userDetails.password, userDetails.salt, function(err, hash) {
    if(err) {
      var errorMessage = 'There was a problem hashing this password. :(';
      callback(err, errorMessage, res, null);
      return;
    }

    var userValues = {
      email: userDetails.email,
      salt: userDetails.salt,
      password: hash
    };
    callback(null, null, res, userValues);
  });
};

/**
 * Return JSON response
 *
 * @function
 * @param {object} err Error object
 * @param {string} errMessage Error message to use in response  
 * @param {object} res Response parameter from request
 * @param {object} responseDetails Data to be included in JSON response
 * @returns {json} Sends client a JSON Object containing details of newly registered user
 */
var finalizeResponse = function(err, errMessage, res, responseDetails) {
  res.json({
    status: (!!err) ? 'failed' : 'success',
    message: (!!err) ? errMessage : 'success',
    data: responseDetails || {}   
  });
};

module.exports = {
  validEmail: validEmail,
  validPassword: validPassword,
  finalizeResponse: finalizeResponse,
  getUser: getUser,
  saltAndHashPassword: saltAndHashPassword
};
