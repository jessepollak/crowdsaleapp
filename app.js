var express = require('express');
var stormpath = require('express-stormpath');
var dashboard = require('./dashboard')
var cookieParser = require('cookie-parser');
var app = module.exports = express();
var crypto = require('crypto');

app.set('views', './views');
app.set('view engine', 'jade');

referral = '';

app.use(stormpath.init(app, {
  apiKeyId: '6DKV6CSOAN7VG5T489O7LZVCU',
  apiKeySecret: 'HaUYvF75HAMNjWD+AYBGP/kXJamlxHcG20q2l5Qz4SM',
  application: 'https://api.stormpath.com/v1/applications/62cfhD5ihSuFHvjaZ1DxI3',
  secretKey: 'sfnsdkfnSLFKDj238472478sufwru29jiKFKSDnf3485',
  expandCustomData: true,
  redirectUrl: '/dashboard',
  cacheTTL: 1,
  cacheTTI: 1,
  enableUsername: true,
  requireUsername: true,
  enableForgotPassword: true,
  enableGoogle: true,
  enableFacebook: true,
  social: {
    facebook: {
      appId: '1577219909182869',
      appSecret: 'd7fe7b60147e1d1c7959419b4e3d26bc',
    },
    google: {
      clientId: '1027831070415-ao8ud975mjup257n7jtg3ju49b26vinm.apps.googleusercontent.com',
      clientSecret: '-qCEjz_4OZA1GNXekAaJ3B9C',
    },
  },
}));

app.use('/dashboard', dashboard);

app.use('/profile',require('./profile')());

app.use('/clef',require('./clef'));

app.get('/', function(req, res) {
  res.render('home', {
    title: 'Welcome',
    csrf_token: createToken(generateSalt(10), '24JFSJFIOH@sf09a82Secnorjwrj24LFOSfjAugur')
  });
});

app.get('/ref*', function(req, res) {
  referral = req.query.id;
  res.render('home', {
    title: 'Welcome',
    csrf_token: createToken(generateSalt(10), '24JFSJFIOH@sf09a82Secnorjwrj24LFOSfjAugur')
  });
});

app.listen(3000);

module.exports = router
module.exports = stormpath

function createToken(salt, secret) {
  return salt + crypto
    .createHash('sha1')
    .update(salt + secret)
    .digest('base64');
}

function generateSalt(length) {
  var i, r = [];
  for (i = 0; i < length; ++i) {
    r.push(SALTCHARS[Math.floor(Math.random() * SALTCHARS.length)]);
  }
  return r.join('');
}

var SALTCHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';