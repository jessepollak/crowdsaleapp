
var include = require('./include');
var root = include.root;
var makeRequest = include.makeRequest;
var appendToURL = include.appendToURL;

var pushtx = {};

pushtx.pushtx = function(tx, apiCode, callback) {

	var payload = {
		'tx': tx
	}

	if (arguments.length === 2) {
		callback = apiCode;
		apiCode = undefined;
	} else {
		payload['api_code'] = apiCode;
	}

	var url = root + 'pushtx/' + encodeURIComponent(JSON.stringify(payload));

	makeRequest(url, callback);
}

module.exports = pushtx;