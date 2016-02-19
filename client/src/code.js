var addListeners = function() {
  $('body').on('submit', '#sign-up-form', function(e) {
    e.preventDefault();
    $('#submit-button').attr({disabled: true});
    var postData = $(this).serializeArray();
    signUpRequest(postData, signUpHandler);
  });

  $('body').on('submit', '#reset-pw-form', function(e) {
    e.preventDefault();
    $('#submit-button').attr({disabled: true});
    var postData = $(this).serializeArray();
    changePasswordRequest(postData, changePasswordHandler);
  });

  $('body').on('submit', '#form-reset-code', function(e) {
    e.preventDefault();
    $('#submit-button').attr({disabled: true});
    var postData = $(this).serializeArray();
    resetPasswordRequest(postData, resetPasswordHandler);
  });

  $('body').on('submit', '#sign-in-form', function(e) {
    e.preventDefault();
    $('#submit-button').attr({disabled: true});
    var postData = $(this).serializeArray();
    authRequest(postData, authHandler);
  });

  // Listener to swap views from sign up to sign in
  $('body').on('click touchend', '#sign-in-link', function(e) {
    e.preventDefault();
    $('#form-sign-up').fadeOut('slow', function() {
      $('#form-sign-in').fadeIn('slow');
    });
  });

  // Listener to swap views from sign in to reset password
  $('body').on('click touchend', '#reset-pw-link', function(e) {
    e.preventDefault();
    $('#form-sign-in').fadeOut('slow', function() {
      $('#form-reset-pw').fadeIn('slow');
    });
  });

  // Start Twitter Auth
  $('body').on('click touchend', '.tw-auth-button', function(e) {
    e.preventDefault();

    $.ajax({
      url : '../api/twitter/getToken',
      type: 'GET',
      success:function(results) {
        console.log(results);
        window.location.replace(results.data.redirectURL);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('Sorry, but we could finish this request.');
      }
    });    
  });

  var signUpHandler = function(results) {
    console.log(results);
    if(results.message !== 'success') {
      // Re-enable button
      $('#submit-button').attr({disabled: false});              
    } else {
      $('#form-sign-up').fadeOut("slow", function() {
        swal('Thanks for signing up!  Check your email to confirm your account.');
      });        
    }
  };

  var authHandler = function(results) {
    console.log(results);
    if(results.message !== 'success' || results.data.auth === false) {
      // Re-enable button
      $('#submit-button').attr({disabled: false});              
      swal('Your password is incorrect.  Try again?');
    } else {
      $('#form-sign-up').fadeOut("slow", function() {
        swal('Guess what?  This is as far as it goes.');
      });        
    }
  };

  var changePasswordHandler = function(results) {
    console.log(results);
    if(results.message !== 'success') {
      // Re-enable button
      $('#submit-button').attr({disabled: false});              
    } else {
      $('#form-reset-pw').fadeOut("slow", function() {
        swal('Your password has been updated.  Write it down this time. :)');
      });        
    }
  };

  var resetPasswordHandler = function(results) {
    console.log(results);
    if(results.message !== 'success') {
      // Re-enable button
      $('#submit-button').attr({disabled: false});              
    } else {
      $('#form-reset-pw').fadeOut("slow", function() {
        swal('Check your email for the next step to reset your password.');
      });        
    }
  };

  // Requests to API
  var signUpRequest = function(postData, callback) {
    $.ajax({
      url : '../api/user/new',
      type: 'POST',
      data : postData,
      success:function(results) {
        callback(results);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('Sorry, but we could finish this request.');
      }
    });
  };

  var authRequest = function(postData, callback) {
    $.ajax({
      url : '../api/auth',
      type: 'POST',
      data : postData,
      success:function(results) {
        callback(results);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('Sorry, but we could finish this request.');
      }
    });
  };

  var resetPasswordRequest = function(postData, callback) {
    $.ajax({
      url : '../api/resetCode/new',
      type: 'POST',
      data : postData,
      success:function(results) {
        callback(results);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('Sorry, but we could finish this request.');
      }
    });
  };

  var changePasswordRequest = function(postData, callback) {
    $.ajax({
      url : '../api/changePassword',
      type: 'PUT',
      data : postData,
      success:function(results) {
        callback(results);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('Sorry, but we could finish this request.');
      }
    });    
  };
};
