
var include = require('./include');
var root = include.root;
var appendToURL = include.appendToURL;
var makeRequest = include.makeRequest;

var exchangeRates = {};

exchangeRates.getTicker = function(a, b) {
	var args = arguments.length;
	if (args === 1) { // a is callback, b is null
		makeRequest(root + 'ticker', a);
	} else if (args === 2) { // a is options, b is callback
		makeRequest(root + 'ticker', function(error, data) {
			if (!error) {
				if (a.currency !== undefined) {
					if (typeof a.currency === 'string') {
						data = data[a.currency];
						if (a.property !== undefined) {
							data = JSON.stringify(data[a.property]);
						}
						b(error, data);
					} else if (typeof a.currency === 'object') {
						a.currency.forEach(function(value, index, array) {
							var currencyData = data[value];
							if (a.property !== undefined) {
								currencyData = JSON.stringify(currencyData[a.property]);
							}
							b(error, currencyData);
						});
					}
				} else {
					b("Error: Must specify a currency (ex: 'USD')");
				}
			} else {
				b(error);
			}
		});
	}

	return exchangeRates;
}

exchangeRates.toBTC = function(amount, currency, callback) {

	if (arguments.length === 2) {
		callback = currency;
		currency = 'USD';
	}

	var url = root + 'tobtc?currency=' + currency + '&value=' + amount;

	makeRequest(url, function(error, data) {
		callback(error, +data);
	});

	return exchangeRates;
}

module.exports = exchangeRates;
