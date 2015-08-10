var express = require('express');
var stormpath = require('express-stormpath');
router = express.Router();
var http = require('http')
var path = require('path')
var request = require('request')
var crypto = require('crypto')
var csrf = require('csurf');
//var nodestormpath = require('stormpath');

var APP_ID = process.env.CLEFID,
    APP_SECRET = process.env.CLEFSECRET;

var accountName;

function stormpathLoginReg(first, last, email, clefID, req, res, app) {
  clefID = clefID.toString()+'augur';
  // also, if already have acc. / already exists when trying to create or auth. let the user know
  getAccount(email, app, req, function() {
    if(accountName) {
      // login
      account = authenticate(email, clefID, req, res, app);
    }
    else {
      var account = {
        givenName: first,
        surname: last,
        username: email,
        email: email,
        password: clefID,
      }
      // make new acc then login
      createAccount(account, email, clefID, req, res, app);
    };
  });
}

function createAccount(account, email, clefID, req, res, app) {
  req.app.get('stormpathApplication').createAccount(account, function(err, account) {
    if (err) console.log(err);
    console.log(account)
    var account = authenticate(email, clefID, req, res, app);
    return account;
  });
}

function getAccount(email, app, req, callback) {
  req.app.get('stormpathApplication').getAccounts({email: email}, function(err, accounts) {
    if (err) console.log(err);
    console.log(accounts);
    // will basically try to authenticate an acc. w/ this email & clefID, if returns an error
    // upon auth then acc w/ that email already exists but not a clef acc.
    if(accounts.items.length) {
      setAccountName(accounts.items[0].givenName, callback); 
    }
    if(accounts.size == 0) {
      setAccountName(0, callback);
    }
  });
}

function setAccountName(name, callback) {
    accountName = name;
    callback();
}

//using username and password
function authenticate(email, pass, req, res, app) {
  req.app.get('stormpathApplication').authenticateAccount({
    username: email,
    password: pass,
  }, function (err, result) {
      try {
        if (err) throw err;
        var account = result.account;
        res.locals.user = account;
        req.app.user = account;
        req.app.get('stormpathApplication').user = account;
        req.stormpathSession.user = account.href;
        var url = req.query.next || req.app.get('stormpathRedirectUrl');
        res.redirect(302, url);
        return account;
      }
      catch(exception) {
        res.redirect(302, '/login');
        return 0;
      }
    }
  );
}

function checkToken(token, secret) {
  if ('string' != typeof token) return false;
  return token === createToken(token.slice(0, 10), secret);
}

function createToken(salt, secret) {
  return salt + crypto
    .createHash('sha1')
    .update(salt + secret)
    .digest('base64');
}

/**
 * Does an OAuth handshake with Clef to get user information.
 *
 * This route is redirected to automatically by the browser when a user
 * logs in with Clef.
 *
 * For more info, see http://docs.getclef.com/v1.0/docs/authenticating-users
 */
router.get('/', function(req, res) {
  // If the state parameter doesn't match what we passed into the Clef button,
  // then this request could have been generated by a 3rd party, so we should
  // abort it.
  //
  // For more protection about the state parameter and CSRF, check out
  // http://docs.getclef.com/v1.0/docs/verifying-state-parameter
  //var state = req.param('state');
  //if (!stateParameterIsValid(req.session, state)) {
  //    return res.status(403).send("Oops, the state parameter didn't match what was passed in to the Clef button.");
  //}
  var user = req.user;
  
  var code = req.param('code');
  
  var state = req.param('state');

  //console.log(state.toString());

  if (!checkToken(state, process.env.CSRFSALT)) {
      return res.status(403).send("Oops, the state parameter didn't match what was passed in to the Clef button.");
  }


  var authorizeURL = 'https://clef.io/api/v1/authorize';
  var infoURL = 'https://clef.io/api/v1/info';
  var form = {
    app_id: APP_ID,
    app_secret: APP_SECRET,
    code: code
  };

  request.post({url: authorizeURL, form: form}, function(error, response, body) {
    var token = JSON.parse(body)['access_token'];
    request.get({url: infoURL, qs: {access_token: token}},
      function(error, response, body) {
        var userData = JSON.parse(body)['info'];
        if(userData) {
          var userID = userData.id;
          console.log(userID);
          var email = userData.email;
          var first = userData.first_name;
          var last = userData.last_name;
          if(!last) {
            last = 'none'
          }
          // get stormpath acc. or make a new one and set email to clef email and pass to clefID
          stormpathLoginReg(first, last, email, userID, req, res);
        }
        else {
          res.redirect('/clef');
          console.log('redirecting');
        }
      });
  });
});

/**
 * Handles logout hook requests sent by Clef when a user logs out on their phone.
 *
 * This method looks up a user by their `clefID` and updates the database to
 * indicate that they've logged out.
 *
 * For more info, see http://docs.getclef.com/v1.0/docs/database-logout
 */
 // this path is /clef/logout
router.post('/logout', function(req, res) {
  var token = req.param('logout_token');
  var logoutURL = 'https://clef.io/api/v1/logout';
  console.log('logging out');
  var form = {
    app_id: APP_ID,
    app_secret: APP_SECRET,
    logout_token: token
  };

  request.post({url: logoutURL, form:form}, function(err, response, body) {
    var response = JSON.parse(body);
    console.log(err);
    console.log(response);
    if (response.success) {
      res.locals.user = '';
      req.app.user = '';
      req.app.get('stormpathApplication').user = '';
      req.stormpathSession.user = '';
      res.redirect('http://sale.augur.net/logout');
    } else {
      console.log(body['error']);
      res.send('bye');
      res.redirect('http://sale.augur.net/logout');      
    }
  });
});

module.exports = router