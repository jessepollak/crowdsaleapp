var express = require('express');
var stormpath = require('express-stormpath');
var blockchain = require('blockchain.info');
var receive = new blockchain.Receive('http://augur-crowdsale.herokuapp.com/blockchain');
var qrcode = require('yaqrcode');

var router = express.Router();

var destination = '';
var uri;

// Capture all requests
// Should check client-side for payment received
// if received load profile page automatically

router.all('/', stormpath.authenticationRequired, function(req, res) {
  //res.render('dashboard', {
  //  title: 'Dashboard'
  //});
  getAddressQR(req, res);
});

function displayQR(req, res, error, data) {
  // The express-stormpath library will populate req.user,
  // all we have to do is set the properties that we care
  // about and then call save(s) on the user object:
  var address = req.user.customData.btcAddress;
  if(address) {
    // do nothing, address already exists
    destination = address;
    uri = 'bitcoin:' + destination + '?label=Augur';
    plainAddr = '' + destination
    var string = qrcode(uri);
    res.render('dashboard', { src: string, uri: uri, address: address, plainAddr: plainAddr});
  }
  else {
    if(!data) {
      res.redirect('/');
    }
    else {
      destination = data.input_address;
      uri = 'bitcoin:' + destination + '?label=Augur';
      plainAddr = '' + destination
      req.user.customData.btcAddress = destination;
      req.user.customData.personWhoReferred = referral;
      req.user.save(function(err){
        if(err){
          if(err.developerMessage){
            console.error(err);
          }
        }
      });
      var string = qrcode(uri);
      res.render('dashboard', { src: string, uri: uri, address: destination, plainAddr: plainAddr});
    }
  }
};


function getAddressQR(req, res) {
  receive.create('1CVHJM1jMVN1wXiYTj1qqGRh6bXNbZmtUp', function(error, data) {
      displayQR(req, res, error, data);
  });
}

module.exports = router

//var code = qr.image('http://blog.nodejitsu.com', { type: 'svg' });
//var output = fs.createWriteStream('nodejitsu.svg')
//code.pipe(output);
//<img src="/path/to/qr.svg" />
//render it then remove file from server
// or send it to the view by passing img: to view