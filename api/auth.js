var bcrypt = require('bcrypt');
var util = require('./util.js');

/**
 * Receives POST requests from /api/auth
 *
 * @function
 * @param {object} req Request Parameter from POST Request
 * @param {object} res Response Parameter from POST Request
 * @param {string} req.body.email
 * @param {string} req.body.password
 */
var auth = function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  util.getUser(res, {email: req.body.email}, function(err, result) {
    if(err) {
      var errorMessage = 'Email Does Not Exist In Database';
      util.finalizeResponse(err, errMessage, res);
      return;
    }

    var userDetails = {
      email: req.body.email,
      password: req.body.password,
      storedSalt: result.salt,
      storedPassword: result.password,
      id: result._id
    };   
    checkPassword(null, null, res, userDetails);          
  });
};


/**
 * Authenticate password
 *
 * @function
 * @param {object} err Error object
 * @param {string} errMessage Error message to use in response
 * @param {object} res Response parameter from request
 * @param {object} userDetails User details to create db entry
 * @param {function} Callback to exectute on error/success
 */
var checkPassword = function(err, errMessage, res, userDetails) {
  
  bcrypt.compare(userDetails.password, userDetails.storedPassword, function(err, result) {
    if(err) {
      var errorMessage = 'Invalid password';
      util.finalizeResponse(err, errorMessage, res);
      return;
    }
    // Create object to use in response
    var authObj = {
      auth: result
    };

    // Append user details to response if authentication is good
    if(result === true) {
      authObj.id = userDetails.id;
      authObj.email = userDetails.email;
    } 

    util.finalizeResponse(null, null, res, authObj);            
  });
};

module.exports = {
  auth: auth
};
