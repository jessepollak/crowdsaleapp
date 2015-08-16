var express = require('express');
var postmark = require('postmark')(process.env.POSTMARK_API_TOKEN);
var stormpath = require('express-stormpath');
var cookieParser = require('cookie-parser');
var keythereum = require("keythereum");

var crypto = require('crypto');
var qrcode = require('yaqrcode');
var forms = require('forms');
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
var extend = require('xtend');
var shortid = require('shortid');

var blockchain = require('blockchain.info');
var blockexplorer = blockchain.blockexplorer;
var receive = new blockchain.Receive('https://sale.augur.net/blockchain');

var HOST_BTC_ADDRESS = '3N6S9PLVizPuf8nZkhVzp11PKhTiuTVE6R';
var PROD_HOST = 'sale.augur.net';

var app = module.exports = express();

app.set('views', './views');
app.set('view engine', 'jade');

app.use(cookieParser());

// setup stormpath
app.use(stormpath.init(app, {

  apiKeyId: process.env.STORMPATHID,
  apiKeySecret: process.env.STORMPATHSECRET,
  application: 'https://api.stormpath.com/v1/applications/62cfhD5ihSuFHvjaZ1DxI3',
  secretKey: process.env.APPSECRET,
  expandCustomData: true,
  loginView: __dirname + '/views/stormpath/login.jade',
  redirectUrl: '/',
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
  templateContext: {
    csrf_token: createToken(generateSalt(10), process.env.CSRFSALT),
  },
}));

// add clef logic in
var clef = require('./clef');
clef(app)

// static handlers
app.use('/legal', express.static('static/legal.html'));
app.use('/privacy', express.static('static/privacy.html'));
app.use(express.static('static'));

// redirect production site to secure version
app.get('*', function(req,res,next) {

  if (req.headers['x-forwarded-proto'] != 'https' && req.get('host') == PROD_HOST) {

    res.redirect('https://' + PROD_HOST + req.url);

  } else {

    next();   // continue to other routes if we're not redirecting
  }
});

/* At the top, with other redirect methods before other routes */
app.get('*',function(req,res,next){
  if(req.headers['x-forwarded-proto']!='https')
    res.redirect('https://sale.augur.net'+req.url)
  else
    next() /* Continue to other routes if we're not redirecting */
})

// main view
app.get('/', function(req, res) {

  if (!req.user) {

    res.render('home', {
      csrf_token: createToken(generateSalt(10), process.env.CSRFSALT),
      saleStarted: getSaleStarted(req, res)
    });

  } else {

    // get a unique btc address if we have not already
    if (req.user.customData.btcAddress) {
      userView(req, res);
    } else {
      receive.create(HOST_BTC_ADDRESS, function(error, data) {
          userView(req, res, error, data);
      });
    }
  }
});

// create ethereum key
app.post('/create_key', function(req, res) {

  var passphrase = req.body.passphrase;

  var dk = keythereum.create();
  key = keythereum.dump(passphrase, dk.privateKey, dk.salt, dk.iv);
  keyJSON = JSON.stringify(key);

  res.contentType('json');
  res.send(JSON.stringify(key));
});

// email ethereum key
app.post('/email_key', function(req, res) {

  console.info('emailing key to user');
  var key = req.body.key;
  var address = req.body.address;
  time = new Date().getTime();
  var emailBody = req.user.fullName + ",\n\nAttached to this email, please find your Ethereum private key for the account " +
  address + " you generated at sale.augur.net\n\nThis key is extremely important, don't lose this file or your password.  Please make a backup (or multiple backups).  Come Augur launch you'll be able to import this into the Augur client.  If you'd like to import into Geth instead (to run a local Ethereum client) install go-ethereum from https://ethereum.org/cli and if you're on Mac go to ~/Library/Ethereum/keystore and paste this file in, if on Linux paste it in ~/.ethereum/keystore, and if on Windows paste it in ~/AppData/Roaming/Ethereum/keystore.  You've now imported your key into geth and can unlock it with your password using geth --unlock \"" + address + "\"" + " console then hitting enter.  However, note that this is not necessary and you will be able to import your key into a blockchain.info style wallet on the Augur site before launch.";

  postmark.send({

    "From": "admin@augur.net",
    "To": req.user.email,
    "Subject": "[Augur Sale] Your Ethereum account key",
    "TextBody": emailBody,
    "Attachments": [{
      "Content": new Buffer(key).toString('base64'),
      "Name": (("UTC--" + time.toString() + "--" + address) || 'ethereumKey'),
      "ContentType": "application/octet-stream"
    }]

  }, function(error, success) {

    if (error) {

      console.error("unable to send email: " + error.message);
      return;
    }
  });

});

app.post('/', function(req, res) {

  // no user, render home
  if (!req.user) {

    res.render('home', {
      csrf_token: createToken(generateSalt(10), process.env.CSRFSALT),
      saleStarted: getSaleStarted(req, res)
    });

  // save manual ethereum address
  } else if (req.body.ethereumAddress) {

    var ethereumAddress = req.body.ethereumAddress;

    // valid address format
    var validFormat = ethereumAddress.match(/^0x[a-fA-F0-9][40]$/);
    console.log(validFormat);

    req.user.customData.ethereumAddress = ethereumAddress;
    req.user.save(function(err) {
      if (err) {
        if (err.developerMessage) {
          console.error(err);
        }
      }
    })
    userView(req, res);
  }
});

// get all user data, balances, etc.
function userView(req, res, error, data) {

  // the express-stormpath library will populate req.user,
  // all we have to do is set the properties that we care
  // about and then call save(s) on the user object.

  var btcAddress = req.user.customData.btcAddress;
  var btcBalance = 0;
  var repPercentage = 0;

  var augurBalance, buyUri, unconfirmedBtc;

  if (btcAddress) {

    // do nothing, address already exists
    buyUri = 'bitcoin:' + req.user.customData.btcAddress + '?label=Augur';

  } else {

    if (!data) {

      res.redirect('/');  // if there's no data, is there an error and should we go to an error page instead?

    } else {

      btcAddress = data.input_address;
      uri = 'bitcoin:' + btcAddress + '?label=Augur';
      buyUri = uri;

      req.user.customData.btcAddress = btcAddress;
      req.user.save(function(err) { if (err) console.error(err) });
    }
  }

  blockexplorer.getAddress(process.env.BLOCKCHAIN, btcAddress, function(error, data) {

    if (data) {

      btcBalance = data.total_received;
      unconfirmedBtc = data.final_balance;

      if (req.user.customData.balance < btcBalance || !req.user.customData.balance) {

        req.user.customData.balance = btcBalance;
        req.user.save(function(err) { if (err) console.error(err) });
      }

      if (data.txs[0]) {
        time = data.txs[0].time;
        if (!req.user.customData.time) {
          req.user.customData.time = time;
          req.user.save(function(err) { if (err) console.error(err) });
        }
      }

      if (!req.user.customData.referralCode) {
        req.user.customData.referralCode = req.user.email + shortid.generate();
        req.user.save(function(err) {
          if (err) {
            console.error(err);
          }
        });
      }

      blockexplorer.getAddress(process.env.BLOCKCHAIN, HOST_BTC_ADDRESS, function(error, data) {

        if (data) {
          augurBalance = data.total_received + unconfirmedBtc;
        }

        if (augurBalance) {

          // will need to push to remove this cose after sale done
          repPercentage = req.user.customData.balance / augurBalance;
          if (req.user.customData.repPercentage < repPercentage || !req.user.customData.repPercentage) {
            req.user.customData.repPercentage = repPercentage;
            req.user.save(function(err) { if (err) console.error(err) });
          }
        }
      });
    }
  });

  // check cookie for referrer id and save to user object if it hasn't been
  if (!req.user.customData.personWhoReferred && req.cookies['ref-id']) {

    // only save the referral code if it isn't the users
    if (req.cookies['ref-id'] !== req.user.customData.referralCode) {

      console.log('saving referrer id', req.cookies['ref-id']);

      req.user.customData.personWhoReferred = req.cookies['ref-id'];
      req.user.save(function(err) { if (err) console.error(err) });
    }
  }

  res.render('home', {

    referralLink: false,
    csrf_token: createToken(generateSalt(10), process.env.CSRFSALT),
    ethereumAddress: req.user.customData.ethereumAddress,
    userEmail: req.user.email,
    btcBalance: btcBalance / 100000000,
    btcAddress: btcAddress,
    referralCode: req.user.customData.referralCode,
    repPercentage: repPercentage * 100,
    buyUri: buyUri,
    qrCode: qrcode(buyUri),
    saleStarted: getSaleStarted(req, res)
  });
}

app.get('/ref*', function(req, res) {

  res.cookie('ref-id', req.query.id, { maxAge: 9000000, httpOnly: true });

  res.redirect(req.protocol + '://' + req.get('host'));
});

app.get('/blockchain', function(req, res) {

  res.send("*ok*");
});


function getSaleStarted(req, res) {

  if (req.query.forceSaleStarted || req.cookies.forceSaleStarted) {

    if (!req.cookies.forceSaleStarted) res.cookie('forceSaleStarted', '1');
    return true;
  }

  var saleDate = new Date(Date.UTC(2015, 07, 17, 16, 00, 00));
  var now = new Date();

  return now > saleDate;
}

function createToken(salt, secret) {

  return salt + crypto
    .createHash('sha1')
    .update(salt + secret)
    .digest('base64');
}

function generateSalt(length) {

  var SALTCHARS = process.env.SALTCHARS;
  var i, r = [];

  for (i = 0; i < length; ++i) {
    r.push(SALTCHARS[Math.floor(Math.random() * SALTCHARS.length)]);
  }
  return r.join('');
}


// start server
app.listen(process.env.PORT || 3000);

module.exports = router
module.exports = stormpath
