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
  apiKeyId: process.env.STORMPATHID,
  apiKeySecret: process.env.STORMPATHSECRET,
  application: 'https://api.stormpath.com/v1/applications/62cfhD5ihSuFHvjaZ1DxI3',
  secretKey: process.env.APPSECRET,
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
      appId: process.env.FBID,
      appSecret: process.env.FBSECRET,
    },
    google: {
      clientId: process.env.GOOGLEID,
      clientSecret: process.env.GOOGLESECRET,
    },
  },
}));

app.use('/dashboard', dashboard);

app.use('/profile',require('./profile')());

app.use('/clef',require('./clef'));

app.get('/', function(req, res) {
  res.render('home', {
    title: 'Welcome',
    csrf_token: createToken(generateSalt(10), process.env.CSRFSALT)
  });
});

app.get('/ref*', function(req, res) {
  referral = req.query.id;
  res.render('home', {
    title: 'Welcome',
    csrf_token: createToken(generateSalt(10), process.env.CSRFSALT)
  });
});

app.listen(process.env.PORT || 3000);

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

var SALTCHARS = process.env.SALTCHARS;
