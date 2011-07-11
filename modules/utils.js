/** 
 * Utils Module
 */
 
// Includes
var stack = require('../lib/long-stack-traces');
 
// Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// Config
var config = require('../config/config');

// UUID
var uuid = require('../lib/node-uuid');

UtilsModule = function() {
};

UtilsModule.prototype.fromJSON = function(jsonMessage) {
  	var jsonObject;
 	if (jsonMessage != undefined) {
 		try {
 			jsonObject = eval('(' + jsonMessage + ')');
 		} catch (Exception) {
 			
 		}
	}
		
	return jsonObject;
};

UtilsModule.prototype.isEven = function(number) {
    return (number%2 == 0) ? true : false;
};

UtilsModule.prototype.trim = function(data) {
	data = data.replace(/^\s+/, '');
	for (var i = data.length - 1; i >= 0; i--) {
		if (/\S/.test(data.charAt(i))) {
			data = data.substring(0, i + 1);
			break;
		}
	}
	return data;
};

UtilsModule.prototype.generateGuid = function() {
	var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

UtilsModule.prototype.generateEpocTime = function() {
	var date = new Date();
	return date.getTime();
};

UtilsModule.prototype.generateFormattedDate = function() {
	var date = new Date();
	date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();
	return date;
};

UtilsModule.prototype.formatBroadcastData = function(name, key, date, data, origin) {
	var broadcastData = JSON.stringify({
		'name': name, 
		'key': key,
		'date': date, 
		'data': data,
		'origin': origin
	});
 	return broadcastData;
};

UtilsModule.prototype.formatLookupBroadcastData = function(key, date, data, origin) {
	var broadcastData = JSON.stringify({
		'name': constants.api.LOOKUP, 
		'key': key,
		'date': date,
		'data': data,
		'origin': origin
	});
 	return broadcastData;
};

UtilsModule.prototype.formatWebsocketApiData = function(type, request, data, origin) {
	var broadcastData = JSON.stringify({
		'type': type, 
		'request': request,
		'data': data,
		'origin': origin
	});
 	return broadcastData;
};

UtilsModule.prototype.safeEncodeKey = function(key) {
	var encodedKey = key.replace(/\//g, '_');
	return encodedKey;
};

UtilsModule.prototype.safeDecodeKey = function(key) {
	key = key.replace(/_/g, '/');
	return key;
};

/**
* Check for bad data and format
*/
UtilsModule.prototype.dataChecker = function(data) {

	var assertObject = {
	
	};
	
	var jsonObject = this.fromJSON(data);	
	var udefinedJsonObject = false;
	var undefinedAttribute = false;
	
	if (jsonObject != undefined) {
		var name;
		if (jsonObject.name != undefined) {
			name = jsonObject.name.toString();
		} else {
			undefinedAttribute = true;
		}
		
		var key;
		if (jsonObject.key != undefined) {
			key = jsonObject.key.toString();
		} else {
			undefinedAttribute = true;
		}
		
		var date;
		if (jsonObject.date != undefined) {
			date = jsonObject.date.toString();
		} else {
			undefinedAttribute = true;
		}
		
		var message;
		if (jsonObject.data != undefined) {
			message = jsonObject.data.toString();
		} else {
			undefinedAttribute = true;
		}
		
		var origin;
		if (jsonObject.origin != undefined) {
			origin = jsonObject.origin.toString();
		} else {
			undefinedAttribute = true;
		}
		
		assertObject.name = name;
	 	assertObject.key = key;
	 	assertObject.date = date;
	 	assertObject.message = message;
	 	assertObject.origin = origin;
	 	
	 	if (undefinedAttribute == true) {			
			assertObject.assert = false;
		 	return assertObject;
		} else {		 				
		 	assertObject.assert = true;
		 	return assertObject;
		}
	} else {		
		assertObject.assert = false;
		return assertObject;
	}	
};

UtilsModule.prototype.formatPluginKey = function(ip, plugin) {
	var date = new Date();
	var key = ip + ':' + constants.api.PLUGINS + ':' + plugin + ':' + date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();
	return key;
};

UtilsModule.prototype.formatLookupPluginKey = function(ip) {
	var key = ip + ':' + constants.api.PLUGINS;
	return key;
};

UtilsModule.prototype.formatLogKey = function(ip, log) {
	var date = new Date();
	var key = ip + ':' + constants.api.LOGS + ':' + log + ':' + date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();
	return key;
};

UtilsModule.prototype.formatLookupLogKey = function(ip) {
	var key = ip + ':' + constants.api.LOGS;
	return key;
};

UtilsModule.prototype.formatAlertKey = function(date) {
	var key;
	if (date != undefined) {
		key = constants.api.ALERTS + ':' + date;
	} else {
		var date = new Date();
		key = constants.api.ALERTS + ':' + date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();
	}
	return key;
}

/**
* Items read from commit_log were already checked, so we can just parse
* them into a bulk load request
*/
UtilsModule.prototype.formatBulkPostData = function(bulkLoadLookupRequest, bulkLoadRequest, jsonString) {
		
	var json = this.fromJSON(jsonString);	
	
	if (json != undefined) {
		if (json.name == constants.api.LOOKUP) {
					
			// Work backwords, check for duplicate keys and duplicate columns
			
			var dataObject = {
				
			};
			
			dataObject['columnname'] = json.data;
			dataObject['columnvalue'] = json.date;			
			dataObject['ttl'] = 0;
			
			var rowObject = {
				rowkey: json.key,
				columns: []
			};
						
			var columnExists = false;
			var columnValuePosition = 0;
			var keyPosition = 0;
			var keyExists = false;
		
			bulkLoadLookupRequest.rowkeys.forEach(
				function(key) {
					if (key.rowkey == json.key) {
						keyExists = true;
						key.columns.forEach(
							function(row) {
								if (row.columnname == json.data) {
									bulkLoadLookupRequest.rowkeys[keyPosition].columns[columnValuePosition] = dataObject;
									columnExists = true;
								} else {
									columnValuePosition++;
								}
							}
						);
						if (!columnExists) {
							bulkLoadLookupRequest.rowkeys[keyPosition].columns.push(dataObject);
						}
					} else {
						keyPosition++;
					}
				}
			);
			
			if (!keyExists) {
				bulkLoadLookupRequest.rowkeys.push(rowObject);
			}
			
		} else {
			
			// Work backwords, check for duplicate keys
			
			var dataObject = {
				
			};
			
			dataObject['columnname'] = json.date;
			dataObject['columnvalue'] = escape(json.data);			
			dataObject['ttl'] = 0;
			
			var rowObject = {
				rowkey: this.safeEncodeKey(json.key),
				columns: []
			};
			
			rowObject.columns.push(dataObject);
			
			var keyPosition = 0;
			var keyExists = false;
			bulkLoadRequest.rowkeys.forEach(
				function(key) {
					if (key.rowkey == json.key) {
						keyExists = true;
						bulkLoadRequest.rowkeys[keyPosition].columns.push(dataObject);
					} else {
						keyPosition++;
					}
				}
			);
			
			if (!keyExists) {
				bulkLoadRequest.rowkeys.push(rowObject);
			} 
		}
	}
	
	// Helps visualize WTF is going on
		
	/*	
	{
    "rowkeys": [
        {
            "rowkey": "rk",

            "columns": [
                {
                    "columnname": "cn",
                    "columnvalue": "cv",
                    "ttl" : 10000
                },
                {
                    "columnname": "cn",
                    "columnvalue": "cv",
                    "ttl" : 10000
                }
            ]
        },
        {
            "rowkey": "rk",
            "columns": [
                {
                    "columnname": "cn",
                    "columnvalue": "cv"
                },
                {
                    "columnname": "cn",
                    "columnvalue": "cv"
                }
            ]
        }
    ]
	}
	*/
	
	
	var returnedObject = {
		
	};
	
	returnedObject['bulkLoadLookupRequest'] = bulkLoadLookupRequest;
	returnedObject['bulkLoadRequest'] = bulkLoadRequest;
	
	return returnedObject;
};

/*
UtilsModule.prototype.aggregateCounters = function(bulkLoadRequest) {

	var counterObject = {
		rowkeys: []
	};

	bulkLoadRequest.rowkeys.forEach(
		function (key) {
			counterObject.rowkeys[key] = {};
			key.columns.forEach(
				function(row) {
					console.log('Column Value to Count: ' + row.columnvalue);
					
					if (counterObject.rowkeys[key][row.columnname]) {
				
						var count = counterObject.rowkeys[key][row.columnname];
						
						console.log('Old Count: ' + count);
						
						count = parseInt(count);
						count = count++;
						counterObject.rowkeys[key][row.columnname] = count;
						
						console.log('Incremented Count: ' + count);

					} else {
						counterObject.rowkeys[key][row.columnname] = 1;
						
						console.log('New Count');
					}
				}
			);
		}
	);
};
*/

UtilsModule.prototype.format = function(command, data) {
	var splitBuffer = [];
	switch (command) {
		case constants.api.LOGS:
			data.trim();
			data.replace('\n', '');
			output_hash = {
				date: new Date().getTime(),
				returned: data
			}
			return JSON.stringify(output_hash);
			break;
	}
};

exports.UtilsModule = UtilsModule;
