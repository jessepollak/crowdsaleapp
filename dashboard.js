var express = require('express');
var stormpath = require('express-stormpath');
var blockchain = require('blockchain.info');
var receive = new blockchain.Receive('http://www.google.com/roflcopta');
var qr = require('qr-image');
var fs = require('fs');

var router = express.Router();

var destination = '';
var uri;

// Capture all requests

router.all('/', stormpath.loginRequired, function(req, res) {
  //res.render('dashboard', {
  //  title: 'Dashboard'
  //});
  getAddressQR(req, res);
});

function displayQR(req, res, error, data) {
  // The express-stormpath library will populate req.user,
  // all we have to do is set the properties that we care
  // about and then call save() on the user object:
  var address = req.user.customData.btcAddress;
  console.log(address);
  if(address) {
    // do nothing, address already exists
    console.log(address);
    destination = address;
    uri = 'bitcoin:' + destination + '?label=Augur';
    console.log(uri);
    var code = qr.image(uri, { type: 'svg' });
    res.type('svg');
    code.pipe(res);
  }
  else {
    console.log(data);
    destination = data.input_address;
    uri = 'bitcoin:' + destination + '?label=Augur';
    console.log(uri);
    var code = qr.image(uri, { type: 'svg' });
    res.type('svg');
    code.pipe(res);
    req.user.customData.btcAddress = destination;
    req.user.save(function(err){
      if(err){
        if(err.developerMessage){
          console.error(err);
        }
      }
    });
  }
};

function getAddressQR(req, res) {
  receive.create('14UBitMVc5nPbSH2TumKAJa2FzA28Nf3ji', function(error, data) {
      displayQR(req, res, error, data);
  });
}

module.exports = router

//var code = qr.image('http://blog.nodejitsu.com', { type: 'svg' });
//var output = fs.createWriteStream('nodejitsu.svg')
//code.pipe(output);
//<img src="/path/to/qr.svg" />
//render it then remove file from server
