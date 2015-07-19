var express = require('express');
var forms = require('forms');
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
var stormpath = require('express-stormpath');
var extend = require('xtend');
var shortid = require('shortid');
var blockchain = require('blockchain.info');
var blockexplorer = blockchain.blockexplorer;


// Declare the schema of our form:

var profileForm = forms.create({
  address: forms.fields.string({
    required: true
  })
});

// Declare the schema of our form:

// A render function that will render our form and
// provide the values of the fields, as well
// as any situation-specific locals

function renderForm(req,res,locals){
  var AugurBalance;
  var repPercentage = 0;
  var bitcoinAddress = req.user.customData.btcAddress;
  console.log(req.user+'wwwat')
  console.log(bitcoinAddress);
  blockexplorer.getAddress(process.env.BLOCKCHAIN, bitcoinAddress, function(error, data) {
      console.log(data);
      if(data) {
        btcBalance = data.total_received;
        console.log(req.user.customData.balance+'444')
        if(req.user.customData.balance < btcBalance) {
          req.user.customData.balance = btcBalance;
          req.user.save(function(err){
            if(err){
              console.error(err);
            }
          });
        } 
        if(data.txs[0]) {
          time = data.txs[0].time;
          console.log(time);
          if(!req.user.customData.time) {
            req.user.customData.time = time;
            req.user.save(function(err){
              if(err){
                console.error(err);
              }
            });
          }
        }
        if(!req.user.customData.referralCode) {
          req.user.customData.referralCode = req.user.email + shortid.generate();
          console.log(req.user.customData.referralCode);
          req.user.save(function(err){
            if(err){
              console.error(err);
            }
          });
        }
        blockexplorer.getAddress(process.env.BLOCKCHAIN, '14UBitMVc5nPbSH2TumKAJa2FzA28Nf3ji', function(error, data) {
          if(data) {
            AugurBalance = data.total_received;
          }
          console.log(AugurBalance+'lll')
          if(AugurBalance) {
            repPercentage = req.user.customData.balance / AugurBalance;
            console.log(req.user.customData.balance+'lm')
            console.log(repPercentage+'lln')
            if(req.user.customData.repPercentage < repPercentage) {
              req.user.customData.repPercentage = repPercentage;
              req.user.save(function(err){
                if(err){
                  console.error(err);
                }
              });
            }
            res.render('profile', extend({
              title: 'My Profile',
              address: req.user.customData.address,
              bitcoinBalance: btcBalance/100000000,
              referralCode: req.user.customData.referralCode,
              repPercent: repPercentage
            },locals||{})); 
          }
          else {
            res.render('profile', extend({
              title: 'My Profile',
              address: req.user.customData.address,
              bitcoinBalance: btcBalance/100000000,
              referralCode: req.user.customData.referralCode,
              repPercent: req.user.customData.repPercentage
            },locals||{}));
          }
        });
      }
  });
}

// Export a function which will create the
// router and return it

module.exports = function profile(){

  var router = express.Router();

  // Capture all requests, the form library will negotiate
  // between GET and POST requests

  router.all('/', stormpath.loginRequired, function(req, res) {
    profileForm.handle(req,{
      success: function(form){
        // The form library calls this success method if the
        // form is being POSTED and does not have errors

        // The express-stormpath library will populate req.user,
        // all we have to do is set the properties that we care
        // about and then call save() on the user object:
        req.user.customData.address = form.data.address;
        req.user.save(function(err){
          if(err){
            if(err.developerMessage){
              console.error(err);
            }
            renderForm(req,res,{
              errors: [{
                error: err.userMessage ||
                err.message || String(err)
              }]
            });
          }else{
            renderForm(req,res,{
              saved:true
            });
          }
        });
      },
      error: function(form){
        // The form library calls this method if the form
        // has validation errors.  We will collect the errors
        // and render the form again, showing the errors
        // to the user
        renderForm(req,res,{
          errors: collectFormErrors(form)
        });
      },
      empty: function(){
        // The form library calls this method if the
        // method is GET - thus we just need to render
        // the form
        renderForm(req,res);
      }
    });
  });

  // This is an error handler for this router

  router.use(function (err, req, res, next) {
    // This handler catches errors for this router
    if (err.code === 'EBADCSRFTOKEN'){
      // The csurf library is telling us that it can't
      // find a valid token on the form
      if(req.user){
        // session token is invalid or expired.
        // render the form anyways, but tell them what happened
        renderForm(req,res,{
          errors:[{error:'Your form has expired.  Please try again.'}]
        });
      }else{
        // the user's cookies have been deleted, we dont know
        // their intention is - send them back to the home page
        res.redirect('/');
      }
    }else{
      // Let the parent app handle the error
      return next(err);
    }
  });

  return router;
};
