var crypto = require('crypto'),
		querystring = require('querystring'),
			http = require('http');
		
AmazonCloudwatchClient = function () {
	
};

AmazonCloudwatchClient.prototype.showResponse = function (jsonObject) {

   var string =  JSON.stringify(jsonObject);
   /**
   * Write this to log
   */
   
};

AmazonCloudwatchClient.prototype.configureHttp = function (requestMethod, query) {

	var options = {
		host: 'monitoring.amazonaws.com',
		port: 80,
		path: query,
		method: requestMethod,
		headers: {	
		  	'Host': 'monitoring.us-east-1.amazonaws.com',
		  	'Content-Length': 0
		}
	};
	
	return options;
	
};

AmazonCloudwatchClient.prototype.timestampBuilder = function() {

	pad = function(n) {
	    if (n < 10) {
	      return '0' + n;
	    } else {
	      return n;
	    }
  	};

	var now = new Date();
	var year = now.getUTCFullYear();
	var month = pad(now.getUTCMonth() + 1);
	var day = pad(now.getUTCDate());
	var hours = pad(now.getUTCHours());
	var minutes = pad(now.getUTCMinutes());
	return '' + year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':00Z';
	
};

AmazonCloudwatchClient.prototype.queryBuilder = function(command, parameters) {

	var map = {
		AWSAccessKeyId: process.env['AWS_ACCESS_KEY_ID'],
		Action: command,
		SignatureMethod: 'HmacSHA256',
		Timestamp: this.timestampBuilder(),
		SignatureVersion: 2,
		Version: '2010-08-01'
	};
	
	for (key in parameters) {
		var value = parameters[key];
		map[key] = typeof parameters[key] === 'function' ? parameters[key]() : parameters[key];
	}
	
	var names = (function() {
		var _results;
		_results = [];
		
		for (key in map) {
			value = map[key];
			_results.push(key);
		}
		return _results;
	})();
	
	names.sort();
	
	var query = [];
	
	for (_i = 0, _len = names.length; _i < _len; _i++) {
		name = names[_i];
		query.push(querystring.escape(name) + '=' + querystring.escape(map[name]));
	}
	
	var toSign = 'GET\n' + ('monitoring.us-east-1.amazonaws.com\n') + '/\n' + query.join("&");
	
	var hmac = crypto.createHmac('sha256', process.env['AWS_SECRET_ACCESS_KEY']);
	hmac.update(toSign);
	
	var digest = querystring.escape(hmac.digest('base64'));
	query.push('Signature=' + digest);
	
	return query;
		
};

AmazonCloudwatchClient.prototype.request = function (action, requestParams, callback) {

	var query = this.queryBuilder(action, requestParams);

	var options = this.configureHttp('GET', '/?' + query.join("&"));
	
	this.makeRequest(options, function (response) {
	
		callback(response);
		
	});

};

AmazonCloudwatchClient.prototype.makeRequest = function (options, callback) {
			
	var restRequest = http.request(options, 
		function (response) {	
									
			var responseData = '';
			
			response.on('data', 
				function (chunk) {
					responseData = responseData + chunk.toString();
				}
			);

			response.on('end',
				function() {
					callback(responseData.trim());
				}
			);
		}
	);
	
	restRequest.on('error', 
		function (exception) {
			/**
			* Write this to log
			*/
		}
	);
	
	restRequest.write('');
	restRequest.end();

};

exports.AmazonCloudwatchClient = AmazonCloudwatchClient;