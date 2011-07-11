/**
* Isidorey Node.js CloudSandra Helper Library
*/

// Your credentials
var token = ''; // Token
var accountId = ''; // AccountId

var sys = require('sys'),
		querystring = require('querystring'),
			http = require('http');
			

CloudsandraApi = function () {

};

CloudsandraApi.prototype.parseForDisplay = function (jsonObject) {

   var string =  JSON.stringify(jsonObject);
   console.log('CloudSandra Response: ' + string);
   
};

/**
*
* Creates a Column Family
* 
* http://api.cloudsandra.net/v0.3/COLUMNFAMILY/{cfName}/{cType}
*/
CloudsandraApi.prototype.createColumnFamily = function (cfName, cfType, requestCallback) {
	
	this.post(['COLUMNFAMILY', cfName, cfType], null, null, function (response) {
		requestCallback(response);
	});
	
};

/**
*
* Creates a Column in a Column Family
* 
* http://api.cloudsandra.net/v0.3/COLUMN/{cfName}/{cName}/{cType}
*/
CloudsandraApi.prototype.createColumn = function (cfName, cName, cType, requestCallback) {

	var postParams = {
		isIndex : 'false'
	};

	this.post(['COLUMN', cfName, cName, cType], null, postParams, function (response) {
		requestCallback(response);
	});
	
};

/**
*
* Creates an Indexed Column in a Column Family
* 
* http://api.cloudsandra.net/v0.3/COLUMN/{cfName}/{cName}/{cType}
*/
CloudsandraApi.prototype.createIndexedColumn = function (cfName, cName, cType, requestCallback) {
	
	var postParams = {
		isIndex : 'true'
	};

	this.post(['COLUMN', cfName, cName, cType], null, postParams, function (response) {
		requestCallback(response);
	});
	
};

/**
*
* Removes an Indexed Column from a Column Family
* 
* http://api.cloudsandra.net/v0.3/COLUMN/{cfName}/{cName}/{cType}
*/
CloudsandraApi.prototype.removeIndexedColumn = function (cfName, cName, requestCallback) {
	
	var postParams = {
		isIndex : 'false'
	};

	this.post(['COLUMN', cfName, cName, cType], null, postParams, function (response) {
		requestCallback(response);
	});
	
};

/**
* 
* Returns a Column Family Description
*
* http://api.cloudsandra.net/v0.3/COLUMNFAMILY/{cfname}
*/
CloudsandraApi.prototype.getColumnFamilyDescription = function (cfName, requestCallback) {

	this.get(['COLUMNFAMILY', cfName], null, function (response) {
		requestCallback(response);
	});
	
};

/**
* 
* Returns all the Column Family descriptions
*
* http://api.cloudsandra.net/v0.3/COLUMNFAMILY
*/
CloudsandraApi.prototype.getColumnFamilies = function (requestCallback) {

	this.get(['COLUMNFAMILY'], null, function (response) {
		requestCallback(response);
	});
	
};

/**
*
* Posts data to a Column Family with a given Row Key
* 
* http://api.cloudsandra.net/v0.3/DATA/{cfName}/{rowKey}?ttl={seconds}&realtime={boolean}
*/
CloudsandraApi.prototype.postData = function (cfName, rowKey, postParams, ttl, requestCallback) {
	var uriParams = [cfName, rowKey];
		
	getParams = {};
	getParams['realtime'] = 'true';	
	
	if (ttl == undefined) {
	
		this.post(['DATA', cfName, rowKey], getParams, postParams, function (response) {
			requestCallback(response);
		});
		
	} else {		
	
		getParams['ttl'] = ttl;
		
		this.post(['DATA', cfName, rowKey], getParams, postParams, function (response) {
			requestCallback(response);
		});
		
	}

};

/**
*
* Posts bulk data in JSON form to a Column Family
* 
* http://api.cloudsandra.net/v0.3/DATA/{cfName}
*/
CloudsandraApi.prototype.postBulkData = function (cfName, jsonStringObject, requestCallback) {

	var postParams = {
		body: jsonStringObject
	};

	this.post(['DATA', cfName], null, postParams, function (response) {
		requestCallback(response);
	});

};

/**
* 
* Returns data from a Column Family with a given Row Key
*
* http://api.cloudsandra.net/v0.3/DATA/{cfname}/{rowKey}
*/
CloudsandraApi.prototype.getRow = function(cfName, rowKey, requestCallback) {
	
	this.get(['DATA', cfName, rowKey], null, function (response) {
		requestCallback(response);
	});
	
};

/**
* 
* Returns paginateable data from a Column Family with a given Row Key based on a limit
*
* http://api.cloudsandra.net/v0.3/DATA/{cfname}/{rowKey}?fromKey={fromKey}&limit={limit}
*/
CloudsandraApi.prototype.paginateRow = function (cfName, rowKey, fromKey, limit, requestCallback) {

	getParams = {};
	
	if (limit != undefined) {
		getParams['limit'] = limit;	
	}
	
	if (fromKey != undefined) {
		getParams['fromKey'] = fromKey;	
	} 
		
	this.get(['DATA', cfName, rowKey], getParams, function (response) {
		requestCallback(response);
	});
	
};

/**
*
* Deletes data from a Column Family with a given Row Key and Column Name
* 
* http://api.cloudsandra.net/v0.3/DATA/{cfName}/{rowKey}/{cName}
*/
CloudsandraApi.prototype.deleteDataFromRow = function (cfName, rowKey, cName, requestCallback) {
	
	this.del(['DATA', cfName, rowKey, cName], null, null, function (response) {
		requestCallback(response);
	});
	
};

/**
*
* Deletes a Row from a Column Family
* 
* http://api.cloudsandra.net/v0.3/DATA/{cfName}/{rowKey}
*/
CloudsandraApi.prototype.deleteRow = function (cfName, rowKey, requestCallback) {
	
	this.del(['DATA', cfName, rowKey], null, null, function (response) {
		requestCallback(response);
	});
	
};

/**
*
* Deletes a Column Family
* 
* http://api.cloudsandra.net/v0.3/COLUMNFAMILY/{cfName}
*/
CloudsandraApi.prototype.deleteColumnFamily = function (cfName, requestCallback) {
	
	this.del(['COLUMNFAMILY', cfName], null, null, function (response) {
		requestCallback(response);
	});
	
};

/**
* 
* CQL
*
* http://api.cloudsandra.net/v0.3/CQL/{cfname}?query={query}
*/
CloudsandraApi.prototype.queryCQL = function (cfName, cql, requestCallback) {
	
	var getParams = {
		query : cql
	};
	
	this.get(['CQL', cfName], getParams, function (response) {
		requestCallback(response);
	});
	
};

/**
* 
* Increment a counter
*
* http://api.cloudsandra.net/v0.3/COUNTER/{rowKey}/{cName}
*/
CloudsandraApi.prototype.incrementCount = function (rowKey, cName, value, requestCallback) {
	
	var postParams = {
		'increment' : value
	};

	this.post(['COUNTER', rowKey, cName], null, postParams, function (response) {
		requestCallback(response);
	});
	
};

/**
* 
* Decrement a counter
*
* http://api.cloudsandra.net/v0.3/COUNTER/{rowKey}/{cName}
*/
CloudsandraApi.prototype.decrementCount = function (rowKey, cName, value, requestCallback) {
	
	var postParams = {
		'decrement' : value
	};

	this.post(['COUNTER', rowKey, cName], null, postParams, function (response) {
		requestCallback(response);
	});
	
};

/**
* 
* Get a counter
*
* http://api.cloudsandra.net/v0.3/COUNTER/{rowKey}/{cName}
*/
CloudsandraApi.prototype.getCount = function (rowKey, cName, requestCallback) {
	
	this.get(['COUNTER', rowKey, cName], null, function (response) {
		requestCallback(response);
	});

};

/**
* 
* Create a table in Hive
*
* http://api.cloudsandra.net/v0.3/MAPREDUCE/table/{table}
*/
CloudsandraApi.prototype.mapReduceTable = function (table, postParams, requestCallback) {
	
	this.post(['MAPREDUCE', 'table', table], null, postParams, function (response) {
		requestCallback(response);
	});
	
};


/**
* 
* Create a job in Hive
*
* http://api.cloudsandra.net/v0.3/MAPREDUCE/job
*/
CloudsandraApi.prototype.mapReduceJob = function (postParams, requestCallback) {
	
	this.post(['MAPREDUCE', 'job'], null, postParams, function (response) {
		requestCallback(response);
	});
	
};

/**
*
* Deletes all Column Families
*
*/
CloudsandraApi.prototype.deleteColumnFamilies = function (requestCallback) {
	var columnFamilyList = [];

	/*
	
	this.request('GET', 'COLUMNFAMILY', null, null, null, function(response) {
		for (key in response) {
			for (i in response[key]) {
				for (j in response[key][i]) {
		  			for (k in response[key][i][j]) {
		  				if (k == 'name') {
		  					var columnFamily = response[key][i][j][k];
		  					columnFamilyList.push(columnFamily.toString());
		  				}
					}
				}
			}
		}

		(function(){
		    var t_count = 0;
		    (function(delay, count) {
	    	    	
		        setTimeout(function() {
		            if (count && ++t_count > count) 
		            	return;
		            
		            requestCallback(columnFamilyList[t_count]);
		            	
		            setTimeout(arguments.callee, delay);
		        }, delay);
		    })(2000, columnFamilyList.length);
		})();
	});
	
	*/
	
};

var simpleRestClient = {
	
	host: 'api.cloudsandra.net',
	version: '/v0.3',
	port: '80',
	username: token,
	password: accountId,
	contentType: 'application/x-www-form-urlencoded'
	
};

CloudsandraApi.prototype.authenticate = function (username, password) {

	var authentication = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
	return authentication;
	
};

CloudsandraApi.prototype.configureHttp = function (requestMethod, uriParams, getParams) {

	var options = {
		host: simpleRestClient.host,
		port: simpleRestClient.port,
		path: simpleRestClient.version + this.pathBuilder(uriParams, getParams),
		method: requestMethod,
		headers: {
		  	'Content-Type': simpleRestClient.contentType,
		  	'Authorization':  this.authenticate(simpleRestClient.username, simpleRestClient.password)
		}
	};
	
	return options;
	
};

CloudsandraApi.prototype.pathBuilder = function (uriParams, getParams) {

	var path;

	if (uriParams != undefined) {
		path = this.segmentBuilder(uriParams);
	} 
		
	if (getParams != undefined) {
		if (uriParams != undefined) {
			path = path + '?' + querystring.stringify(getParams);
		} else {
			path = '?' + querystring.stringify(getParams);
		}
	}
	
	return path;
	
};

CloudsandraApi.prototype.segmentBuilder = function (uriParams) {

	var append;
	var segmentCount = 0;
	
	uriParams.forEach(
		function(segment) {			
			if (segmentCount == 0) {
				append = segment;
			} else {
				append = append + '/' + segment;
			}
			segmentCount++;
		}
	);
	
	append = '/' + append;
		
	return append;
	
};

CloudsandraApi.prototype.post = function (uriParams, getParams, postParams, callback) {
						
	var options = this.configureHttp('POST', uriParams, getParams);
	var queryString = querystring.stringify(postParams);

	this.makePostRequest(options, queryString, uriParams, getParams, postParams, function (response) {
		callback(response);
	});

};

CloudsandraApi.prototype.get = function (uriParams, getParams, callback) {

	var options = this.configureHttp('GET', uriParams, getParams);

	this.makeGetRequest(options, uriParams, getParams, function (response) {
		callback(response);
	});

};

CloudsandraApi.prototype.del = function (uriParams, getParams, postParams, callback) {
		
	var options = this.configureHttp('DELETE', uriParams, getParams);
	var queryString = querystring.stringify(postParams);

	this.makeDeleteRequest(options, queryString, uriParams, getParams, postParams, function (response) {
		callback(response);
	});

};

CloudsandraApi.prototype.makePostRequest = function (options, queryString, uriParams, getParams, postParams, callback) {

	console.log('hitting url: ' + simpleRestClient.host + simpleRestClient.version + this.pathBuilder(uriParams, getParams));
	console.log('post string: ' + queryString);
	
	if (postParams && postParams.body) {
		options.headers['Content-Length'] = postParams.body.length;
	} else {
		if (postParams) {
			options.headers['Content-Length'] = queryString.length;
		} else {
			options.headers['Content-Length'] = 0;
		}
	}
		
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
	
	// this.handleTerribleNoGoodVeryBadConnectionRefusedRequest(restRequest);
	
	if (postParams && postParams.body) {
		restRequest.write(postParams.body);
	} else if (postParams) {
		restRequest.write(querystring.stringify(postParams));
	} else {
		restRequest.write('');
	}
	
	restRequest.end();
	
	restRequest.on('error',
		function(error) {
			console.log('ERRORRRRRRRRRRRRRRRR' + error);
		}
	);
	
};

CloudsandraApi.prototype.makeGetRequest = function (options, uriParams, getParams, callback) {

	options.headers['Content-Length'] = 0;
			
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
	
	// this.handleTerribleNoGoodVeryBadConnectionRefusedRequest(restRequest);
	
	restRequest.write('');
	restRequest.end();

};

CloudsandraApi.prototype.makeDeleteRequest = function (options, queryString, uriParams, getParams, postParams, callback) {
	
	if (postParams) {
		options.headers['Content-Length'] = queryString.length;
	} else {
		options.headers['Content-Length'] = 0;
	}
	
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
	
	// this.handleTerribleNoGoodVeryBadConnectionRefusedRequest(restRequest);
	
	if (postParams) {
		restRequest.write(querystring.stringify(postParams));
	} else {
		restRequest.write('');
	}
	
	restRequest.end();
	
};

CloudsandraApi.prototype.handleTerribleNoGoodVeryBadConnectionRefusedRequest = function (restRequest) {
	restRequest.socket.addListener('error', function(socketException) {
	    if (socketException.errno === 61) {
	        console.log('For some reason, this *would* kill the process - ECONNREFUSED: connection refused to ' + request.socket.host + ':' + request.socket.port);
	    } else {
	        console.log(socketException);
	    }
	});
};

CloudsandraApi.prototype.handleResponse = function(response) {
	
};

exports.CloudsandraApi = CloudsandraApi;