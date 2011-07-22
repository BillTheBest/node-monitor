/** 
 * utilities-manager.js module
 */
 
var fs = require('fs');

var Module = {};

UtilitiesManagerModule = function (childDeps) {

	for (var name in childDeps) {
		eval('var ' + name + ' = require(\'' + childDeps[name] + '\')');
	}
	
	var constants = new constantsManager.ConstantsManagerModule();

	Module = this;
	
	Module.constants = constants;
	
};

UtilitiesManagerModule.prototype.fromJSON = function (jsonMessage) {

  	var jsonObject;
 	if (jsonMessage != undefined) {
 		try {
 			jsonObject = eval('(' + jsonMessage + ')');
 		} catch (Exception) {
 	 
 	 	}
	}
		
	return jsonObject;
	
};

UtilitiesManagerModule.prototype.toJSON = function (object) {

  	return JSON.stringify(object);
  		
};

UtilitiesManagerModule.prototype.isEven = function (number) {

    return (number%2 == 0) ? true : false;
    
};

UtilitiesManagerModule.prototype.trim = function (data) {

	data = data.replace(/^\s+/, '');
	for (var i = data.length - 1; i >= 0; i--) {
		if (/\S/.test(data.charAt(i))) {
			data = data.substring(0, i + 1);
			break;
		}
	}
	
	return data;
	
};

UtilitiesManagerModule.prototype.generateEpocTime = function() {

	var date = new Date();
	return date.getTime();
	
};

UtilitiesManagerModule.prototype.generateFormattedDate = function() {

	var date = new Date();
	date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();
	
	return date;
	
};

UtilitiesManagerModule.prototype.formatBroadcastData = function (name, key, date, data, origin) {

	var broadcastData = JSON.stringify({
		'name': name, 
		'key': key,
		'date': date, 
		'data': data,
		'origin': origin
	});
	
 	return broadcastData;
 	
};

UtilitiesManagerModule.prototype.formatLookupBroadcastData = function(key, date, data, origin) {

	var broadcastData = JSON.stringify({
		'name': Module.constants.api.LOOKUP, 
		'key': key,
		'date': date,
		'data': data,
		'origin': origin
	});
	
 	return broadcastData;
 	
};

UtilitiesManagerModule.prototype.formatWebsocketApiData = function (type, request, data, origin) {

	var broadcastData = JSON.stringify({
		'type': type, 
		'request': request,
		'data': data,
		'origin': origin
	});
	
 	return broadcastData;
 	
};

UtilitiesManagerModule.prototype.safeEncodeKey = function (key) {

	var encodedKey = key.replace(/\//g, '_');
	return encodedKey;
	
};

UtilitiesManagerModule.prototype.safeDecodeKey = function (key) {

	key = key.replace(/_/g, '/');
	return key;
	
};

/**
* Check for bad data and format
*/
UtilitiesManagerModule.prototype.dataChecker = function (data) {

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

UtilitiesManagerModule.prototype.formatPluginKey = function(ip, plugin) {
	var date = new Date();
	var key = ip + ':' + Module.constants.api.PLUGINS + ':' + plugin + ':' + date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();
	return key;
};

UtilitiesManagerModule.prototype.formatLookupPluginKey = function(ip) {
	var key = ip + ':' + Module.constants.api.PLUGINS;
	return key;
};

UtilitiesManagerModule.prototype.formatLogKey = function(ip, log) {
	var date = new Date();
	var key = ip + ':' + Module.constants.api.LOGS + ':' + log + ':' + date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();
	return key;
};

UtilitiesManagerModule.prototype.formatLookupLogKey = function (ip) {
	var key = ip + ':' + Module.constants.api.LOGS;
	return key;
};

UtilitiesManagerModule.prototype.formatAlertKey = function(date) {
	var key;
	if (date != undefined) {
		key = Module.constants.api.ALERTS + ':' + date;
	} else {
		var date = new Date();
		key = Module.constants.api.ALERTS + ':' + date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();
	}
	return key;
}

/**
* This feature requires Bulk Counter Posting
*
* Log Entry key: epoc / Log Entry valeu: word1 word2 word2 word3
*
* We'll index words based on rowkey, e.g:
*
	// Helps visualize WTF is going on
		
	{
    "rowkeys": [
        {
            "rowkey": "127.0.1:logs:_var_log_messages:2011:08:1",

            "columns": [
                {
                    "columnname": "word1",
                    "increment" : 1
                },
                {
                   "columnname": "word2",
                    "increment" : 2
                },
                {
                   "columnname": "word3",
                    "increment" : 1
                }
            ]
        }
    ]
	}
*
*/
UtilitiesManagerModule.prototype.wordIndex = function(string) {
	var logEntryIndexArray = string.replace(/[^\w\s]|_/g, function ($1) { 
		return ' ' + $1 + ' ';
	}).replace(/[ ]+/g, ' ').split(' ');
};

/**
* Items read from commit_log were already checked, so we can just parse
* them into a bulk load request.  We escape all json.
*/
UtilitiesManagerModule.prototype.formatBulkPostData = function(bulkLoadLookupRequest, bulkLoadRequest, jsonString) {
		
	var json = this.fromJSON(jsonString);	
	
	if (json != undefined) {
		if (json.name == Module.constants.api.LOOKUP) {
					
			/**
			* Work backwords, check for duplicate keys and columns
			*/
			
			var dataObject = {
				
			};
			
			/**
			* For some reason, columns are coming through undefined
			*/
			if (json.data == undefined) {
				dataObject['columnname'] = '';
			} else {
				dataObject['columnname'] = json.data;
			}
			
			if (json.data == undefined) {
				dataObject['columnvalue'] = '';
			} else {
				dataObject['columnvalue'] = json.date;
			}
						
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
			
			/**
			* Work backwords, check for duplicate keys
			*/			
			
			var dataObject = {
				
			};
			
			if (json.data == undefined) {
				dataObject['columnname'] = '';
			} else {
				dataObject['columnname'] = json.key;
			}
			
			if (json.data == undefined) {
				dataObject['columnvalue'] = '';
			} else {
				dataObject['columnvalue'] = escape(json.data);
			}
	
			dataObject['ttl'] = '0';
			
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
	
	/**
	* Helps visualize WTF is going on
	*/
		
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
UtilitiesManagerModule.prototype.aggregateCounters = function(bulkLoadRequest) {

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

UtilitiesManagerModule.prototype.format = function(command, data) {
	var splitBuffer = [];
	switch (command) {
		case Module.constants.api.LOGS:
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

exports.UtilitiesManagerModule = UtilitiesManagerModule;
