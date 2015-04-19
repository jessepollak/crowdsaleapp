
var include = require('./include'),
root = include.root,
makeRequest = include.makeRequest,
appendToURL = include.appendToURL;

var blockexplorer = {};

blockexplorer.getBlock = function(blockId, apiCode, callback) {

	if (arguments.length === 2) {
		callback = apiCode;
		apiCode = undefined;
	}

	var url = root + 'rawblock/' + blockId + '?a=1';
	url += appendToURL('api_code', apiCode);

	makeRequest(url, callback);
}

blockexplorer.getTx = function(txId, apiCode, callback) {

	if (arguments.length === 2) {
		callback = apiCode;
		apiCode = undefined;
	}

	var url = root + 'rawtx/' + txId + '?a=1';
	url += appendToURL('api_code', apiCode);

	makeRequest(url, callback);
}

blockexplorer.getBlockHeight = function(height, apiCode, callback) {

	if (arguments.length === 2) {
		callback = apiCode;
		apiCode = undefined;
	}

	var url = root + 'block-height/' + height + '?format=json';
	url += appendToURL('api_code', apiCode);

	makeRequest(url, callback);
}

blockexplorer.getAddress = function(options, address, callback) {

	if (arguments.length === 2) {
		callback = address;
		address = options;
		options = {};
	}

	var url = root + 'address/' + address + '?format=json';
	url += appendToURL('limit', options.limit);
	url += appendToURL('offset', options.offset);
	url += appendToURL('api_code', options.apiCode);

	makeRequest(url, callback);
}

blockexplorer.getMultiAddress = function(array_or_xpub, apiCode, callback) {

	if (arguments.length === 2) {
		callback = apiCode;
		apiCode = undefined;
	}

	var active;
	if (typeof array_or_xpub === 'object') active = array_or_xpub.join('|');
	else active = array_or_xpub;

	var url = root + 'multiaddr?active=' + active;
	url += appendToURL('api_code', apiCode);

	makeRequest(url, callback);
}

blockexplorer.getUnspentOutputs = function(address, apiCode, callback) {

	if (arguments.length === 2) {
		callback = apiCode;
		apiCode = undefined;
	}

	if (typeof address === 'object') {
		address = address.join('|');
	}

	var url = root + 'unspent?active=' + address;
	url += appendToURL('api_code', apiCode);

	makeRequest(url, callback);
}

blockexplorer.getLatestBlock = function(apiCode, callback) {

	if (arguments.length === 1) {
		callback = apiCode;
		apiCode = undefined;
	}

	var url = root + 'latestblock?a=1';
	url += appendToURL('api_code', apiCode);

	makeRequest(url, callback);
}

blockexplorer.getUnconfirmedTx = function(apiCode, callback) {

	if (arguments.length === 1) {
		callback = apiCode;
		apiCode = undefined;
	}

	var url = root + 'unconfirmed-transactions?format=json';
	url += appendToURL('api_code', apiCode);

	makeRequest(url, callback);
}

blockexplorer.getBlocks = function(options, callback) {

	var url = root + 'blocks/';

	if (!options.time && !options.pool) {
		callback('err: Must include time or pool');
	} else {
		if (options.pool) {
			url += String(options.pool) + '?format=json';
			url += appendToURL('time_in_milliseconds', options.time);
		}
		else if (options.time) {
			url += options.time + '?format=json';
		} 
		url += appendToURL('api_code', options.apiCode);

		makeRequest(url, callback);
	}
}

blockexplorer.getInventoryData = function(hash, apiCode, callback) {

	if (arguments.length === 2) {
		callback = apiCode;
		apiCode = undefined;
	}

	var url = root + 'inv/' + hash + '?format=json';
	url += appendToURL('api_code', apiCode);

	makeRequest(url, callback);
}

module.exports = blockexplorer;