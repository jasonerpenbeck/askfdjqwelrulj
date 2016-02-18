var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('wPA9ELWF9CfaOpRsl6eMtQ');

/**
 * Generic function to send e-mails to users
 * @function
 * @alias exports.sendMessage
 * @param {string} messageType Type of message to send to user
 * @param {string} email Email address of message recipient
 * @param {object} messageData Custom data to add to message (optional)
 */
var sendMessage = function(messageType, email, messageData) {
  messageData = messageData || {};
  if(!email) {
    console.log('No email address. Do not send.');
    return;
  }

  // Get details to use for message
  var messageDetails = createMessage(messageType, messageData);

  if(!!messageDetails) {
    var message = {
      "html": messageDetails.html,
      "text": messageDetails.text,
      "subject": messageDetails.subject,
      "from_email": "jason.erpenbeck@gmail.com",
      "from_name": "Your Pal, Jason",
      "to": [{
        "email": email,
        "name": email,
        "type": "to"
      }],
      "headers": {
        "Reply-To": "jason.erpenbeck@gmail.com"
      },
      "important": false
    };

    var mandrillProperties = {"message": message, "async": false, "ip_pool": "Whatever"};
    mandrill_client.messages.send(mandrillProperties, function(result) {
        console.log("Message sent to: ", email);
      },
      function(e) {
        console.log(e, 'A mandrill error occurred: ' + e.name + ' - ' + e.message);
    });
  } else {
    return;
  }
};

/**
 * Create message contents
 * @function
 * @param {string} messageType Type of message to send to user
 * @param {object} messageData Custom data to add to message
 */
var createMessage = function(type, messageData) {
  var message = {};
  var code;
  if(type === 'activate') {
    code = messageData.activationCode;
    htmlContent = [
      'Hi!  So glad you decided to sign up, but I have to ask one more favor.  ',
      'Please ',
      '<a href="http://127.0.0.1:5000/activate?code=' + code + '">',
      'click here',
      '</a> to verify yourself. :)'
    ].join('');

    message.title = 'Almost There!';
    message.subject = 'Almost There!';

    message.text = [
      'Hi!  So glad you decided to sign up, but I have to ask one more favor.  ',
      'Please go to: ',
      'http://127.0.0.1:5000/activate?code=' + code + ' ',
      ' to verify yourself. :)'
    ].join('');
  } else if(type === 'reset') {
    code = messageData.resetCode;
    htmlContent = [
      'No shame in forgetting your password.  It happens to the best of us.  ',
      'Please ',
      '<a href="http://127.0.0.1:5000/reset?code=' + code + '">',
      'click here',
      '</a> to change it to something memorable.'
    ].join('');
  
    message.title = 'Time To Change It Up!';
    message.subject = 'Time To Change It Up!';    
    message.text = [
      'No shame in forgetting your password.  It happens to the best of us.  ',
      'Please ',
      'http://127.0.0.1:5000/reset?code=' + code + ' ',
      'to change it to something memorable.'
    ].join('');
  } else if(type === 'welcome') {
    htmlContent = 'Hey there!  Thanks for signing up.  Take a look around, and let me know what you think. 👀';    
  
    message.title = 'Welcome!';
    message.subject = 'Welcome!';    
    message.text = 'Hey there!  Thanks for signing up.  Take a look around, and let me know what you think.';
  } else {
    console.log('Invalid messageType');
    return null;
  }

  message.html = htmlTemplate(message.title, htmlContent);
  return message;
};

/**
 * Format HTML for email message
 * @function
 * @param {string} title Text to add to title tag of HTML email
 * @param {string} messageContent Email message to append to HTML body
 */
var htmlTemplate = function(title, messageContent) {
  var emailTitle = title || '';
  var emailContent = messageContent || '';

  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<title>',
    emailTitle,
    '</title>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width">',
    '</head>',
    '<body>',
    emailContent,
    '</body>',
    '</html>'
  ].join('\n');
};

module.exports = {
  sendMessage: sendMessage
};
