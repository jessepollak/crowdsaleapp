
var MyWallet = require('./MyWallet');
var include = require('./include');
var root = include.root;
var appendToURL = include.appendToURL;
var makeRequest = include.makeRequest;

function CreateWallet(pass, code, options) {

	options = options || {};
	this.pass = pass;
	this.url = root + 'api/v2/create_wallet?password=' + this.pass + '&api_code=' + code;

	this.url += appendToURL('priv', options.privateKey);
	this.url += appendToURL('label', options.label);
	this.url += appendToURL('email', options.email);

	return this;
}

CreateWallet.prototype.create = function(callback) {
	makeRequest(this.url, callback);
}

CreateWallet.prototype.open = function(callback) {
	makeRequest(this.url, function(error, data) {
		if (!error) {
			var newWallet = new MyWallet(data['guid'], this.pass);
			callback(null, newWallet);
		} else {
			callback(error);
		}
	});
}

module.exports = CreateWallet;