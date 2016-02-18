var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var _ = require('lodash');
var db = require('./db.js');

var send = require('./sendMessage.js');
var util = require('./util.js');

/**
 * Returns code necessary to reset password
 *
 * @function
 * @param {object} req Request Parameter from POST Request
 * @param {object} res Response Parameter from POST Request
 * @param {string} req.body.email
 */
var getResetCode = function(req, res) {
  util.getUser(res, {email: req.body.email}, function(err, result) {
    if(err) {
      console.log('Error retrieving user: ', err);
      var errMessage = 'Email Does Not Exist In Database';
      addResetCode(err, errMessage, res);
      return;
    }

    var userDetails = {
      email: req.body.email,
      userId: result._id
    };   
    addResetCode(null, null, res, userDetails, util.finalizeResponse);          
  });
};

/**
 * Adds password reset code to database
 *
 * @function
 * @param {object} err Error object
 * @param {string} errMessage Error message to use in response  
 * @param {object} res Response parameter from request
 * @param {object} userDetails userDetails User details to create db entry
 * @param {function} callback Function to exectute on error/success
 */
var addResetCode = function(err, errMessage, res, userDetails, callback) {
  if(err) {
    callback(err, errMessage, res)
    return;
  }

  var codeDetails = {
    resetCode: uuid.v1(),
    userId: userDetails.userId
  };

  db.resetCodes.insert(codeDetails, function(err, newDoc) {
    if(err) {
      console.log('Error inserting code to reset password: ', err);
      var errMessage = 'Unable to add code to reset password';
      callback(err, errMessage, res);
      return;
    }

    var messageDetails = {
      resetCode: codeDetails.resetCode,
      email: userDetails.email
    }
    send.sendMessage('reset', userDetails.email, messageDetails);
    callback(null, null, res, {});
  });
};

/**
 * Endpoint to change a user's password
 *
 * @function
 * @param {object} req Request Parameter from PUT Request
 * @param {object} res Response Parameter from PUT Request
 */
var changePassword = function(req, res) {
  db.resetCodes.find({ resetCode: req.body.code }, function (err, docs) {
    if(err) {
      console.log('Error retrieving reset password code: ', err);
      var errMessage = 'Unable to change password';
      updatePassword(err, errMessage, res, null, util.finalizeResponse);
      return;
    }

    console.log(docs);
    util.getUser(res, {_id: docs[0].userId}, function(err, user) {
      if(err) {
        console.log('Error retrieving user associated with reset code associated: ', err)
        util.finalizeResponse(true, 'No user associated with password reset code.', res);
        return;
      }

      var userDetails = {
        _id: user._id,
        email: user.email,
        password: req.body.password
      };

      util.saltAndHashPassword(res, userDetails, function(err, errMessage, res, details) {
        updatePassword(null, null, res, details, util.finalizeResponse);
      });

    });
  });
};

/**
 * Updates password in database
 *
 * @function
 * @param {object} err Error object
 * @param {string} errMessage Error message to use in response  
 * @param {object} res Response parameter from request
 * @param {object} userDetails userDetails User details to create db entry
 * @param {function} callback Function to exectute on error/success
 */
var updatePassword = function(err, errMessage, res, userDetails, callback) {
  if(err) {
    callback(err, errMessage, res)
    return;
  }

  db.users.update({ email: userDetails.email }, {$set: { password: userDetails.password, salt: userDetails.salt} }, {}, function (err, numReplaced) {
    if(err) {
      var errMessage = 'There was a problem updating the password of this user';      
      console.log('Error Updating Password', err);
      callback(err, errMessage, res);
      return;
    }

    callback(null, null, res, {});    
  });
};

module.exports = {
  getResetCode: getResetCode,
  changePassword: changePassword,
};