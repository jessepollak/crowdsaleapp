
var include = require('./include');
var root = include.root;
var appendToURL = include.appendToURL;
var makeRequest = include.makeRequest;

var statistics = {};

statistics.get = function(options, callback) {

	if (arguments.length === 1) {
		callback = options;
		options = {};
	}

	var url = root + 'stats?format=json';
	url += appendToURL('api_code', options.apiCode);

	makeRequest(url, function(error, data) {
		if (!error) {
			if (!options.stat) {
				callback(error, data);
			} else if (typeof data[options.stat] !== 'undefined') {
				callback(error, Number(data[options.stat]));
			} else {
				callback('err: Stat nonexistent');
			}
		} else {
			callback(error);
		}
	})

}

statistics.getChartData = function(chartType, domain, callback) {

	if (arguments.length === 2) {
		callback = domain;
		domain = undefined;
	}

	var url = root + 'charts/' + chartType + '?format=json';

	makeRequest(url, function(error, data) {
		if (!error) {
			if (!domain) {
				callback(error, data);
			} else if (typeof domain === 'object') {
				var newVals = [];
				data.values.forEach(function(value, index, array) {
					var xVal = Number(value.x);
					if (xVal > domain[0] && xVal < domain[1]) {
						newVals.push(value);
					}
					if (index === (array.length - 1)) {
						callback(error, {values: newVals});
					}
				});
			} else {
				callback('err: Domain must be in the form of an array');
			}
		} else {
			callback(error);
		}
	});

}

module.exports = statistics;