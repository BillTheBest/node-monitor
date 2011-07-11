/** 
 * Websocket API Module
 */
 
// Includes
var stack = require('../lib/long-stack-traces');
 
// Utilities
var utilsModule = require('../modules/utils');
var utils = new utilsModule.UtilsModule(); 
 
// Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// Config
var config = require('../config/config');

// Logging
var logger = require('./logger');

// EC2
var ec2Module = require('../modules/ec2');
var ec2 = new ec2Module.EC2Module();

// DAO
var daoModule = require('../modules/dao');
var dao = new daoModule.DAOModule();

// Getters and Setters
var websocketObject;

WebsocketApiModule = function(websocketServer2) {
	websocketObject = new this.websocketServer(websocketServer2);
};

WebsocketApiModule.prototype.websocketServer = function(val) {
	var value = val;
    
    this.getWebsocketServer = function(){
        return value;
    };
    
    this.setWebsocketServer = function(val){
        value = val;
    };
};

WebsocketApiModule.prototype.handleRequest = function(data) {
	
	logger.write(constants.levels.INFO, 'Handling Websocket API request: ' + data);
	
	var assertObject = {
	
	};

	var jsonObject = utils.fromJSON(data);	
	var udefinedJsonObject = false;
	var undefinedAttribute = false;
	
	if (jsonObject != undefined) {
		logger.write(constants.levels.INFO, 'JSON checks out');
		
		var type;
		if (jsonObject.type != undefined) {
			type = jsonObject.type.toString();
			logger.write(constants.levels.INFO, 'Type: ' + type);
		} else {
			logger.write(constants.levels.INFO, 'Undefined Type');
			undefinedAttribute = true;
		}
		
		var request;
		if (jsonObject.request != undefined) {
			request = jsonObject.request.toString();
			logger.write(constants.levels.INFO, 'Request: ' + request);
		} else {
			logger.write(constants.levels.INFO, 'Undefined Request');
			undefinedAttribute = true;
		}
		
		var message;
		if (jsonObject.data != undefined) {
			message = jsonObject.data.toString();
			logger.write(constants.levels.INFO, 'Message: ' + message);
		} else {
			logger.write(constants.levels.INFO, 'Undefined Data');
			undefinedAttribute = true;
		}
		
		assertObject.type = type;
	 	assertObject.request = request;
	 	assertObject.message = message;
		
		var subRequest;	
		if (jsonObject.subRequest != undefined) {
			subRequest = jsonObject.subRequest.toString();
			assertObject.subRequest = subRequest;
			logger.write(constants.levels.INFO, 'Sub Request: ' + subRequest);
		} else {
			logger.write(constants.levels.INFO, 'Undefined Sub Request');
		}
					
		if (undefinedAttribute) {
			logger.write(constants.levels.INFO, 'Undefined attribute, ignoring');
			assertObject.assert = false;
		} else {
		 	assertObject.assert = true;
		}
	} else {
		logger.write(constants.levels.INFO, 'Undefined jsonObject, user probably made a bad request');
		assertObject.assert = false;
	}
	
	if (assertObject.assert) {			
		switch(request) {
			case constants.api.SERVER:
				this.handleServerRequest(jsonObject);
				break;
			case constants.api.USERS:
				this.handleUsersRequest(jsonObject);
				break;
			case constants.api.CLIENTS:
				this.handleClientsRequest(jsonObject);
				break;
			case constants.api.INSTANCES:
				this.handleInstancesRequest(jsonObject);
				break;
			case constants.api.LOGS:
				this.handleLogsRequest(jsonObject);
				break;
			case constants.api.PLUGINS:
				this.handlePluginsRequest(jsonObject);
				break;
			case constants.api.LOG_LIVE:
				this.handleLogLiveRequest(jsonObject);
				break;
			case constants.api.LOG_HISTORY:
				this.handleLogHistoryRequest(jsonObject);
				break;
			case constants.api.PLUGIN_LIVE:
				this.handlePluginLiveRequest(jsonObject);
				break;
			case constants.api.PLUGIN_HISTORY:
				this.handlePluginHistoryRequest(jsonObject);
				break;
			case constants.api.ALERTS_LIVE:
				this.handleAlertsLiveRequest(jsonObject);
				break;
			case constants.api.ALERTS_HISTORY:
				this.handleAlertsHistoryRequest(jsonObject);
				break;
			case constants.api.CLIENT_TAGS:
				this.handleClientTagsRequest(jsonObject);
				break;
			case constants.api.CLIENT_EXTERNAL:
				this.handleClientExternalRequest(jsonObject);
				break;
			case constants.api.MAPREDUCE_TABLE:
				this.handleMapReduceTableRequest(jsonObject);
				break;
			case constants.api.MAPREDUCE_JOB:
				this.handleMapReduceTableRequest(jsonObject);
				break;
		}
	}
};

WebsocketApiModule.prototype.handleServerRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:

			dao.getRow(constants.values.CFUTF8Type, constants.api.SERVER, function (response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.SERVER, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			break;
	}
};

WebsocketApiModule.prototype.handleUsersRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:
	
			dao.getRow(constants.values.CFUTF8Type, constants.api.USERS, function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.USERS, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			/* 
			 * Delete user on refresh of page - call doesn't exist yet
			 */
			/*
			var deleteParams = {};
	   		deleteParams[conn.id] = utils.generateFormattedDate();
			CloudsandraApi.postData(constants.values.CF, constants.api.USERS, postParams, function(response) {
				CloudsandraApi.parseForDisplay(response);
			});
			*/
			break;
	}
};

WebsocketApiModule.prototype.handleClientsRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:

			dao.getRow(constants.values.CFUTF8Type, constants.api.CLIENTS, function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.CLIENTS, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			
			dao.deleteDataFromRow(constants.values.CFUTF8Type, constants.api.CLIENTS, jsonObject.data, function(response) {
				
			});
		
			break;
	}
};

WebsocketApiModule.prototype.handleInstancesRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:
			this.getEC2Instances();
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			break;
	}
};

WebsocketApiModule.prototype.handleLogsRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:

			dao.getRow(constants.values.CFUTF8Type, jsonObject.data + ':' + constants.api.LOGS, function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.LOGS, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			break;
	}
};

WebsocketApiModule.prototype.handlePluginsRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:

			dao.getRow(constants.values.CFUTF8Type, jsonObject.data + ':' + constants.api.PLUGINS, function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.PLUGINS, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			
			dao.deleteDataFromRow(constants.values.CFUTF8Type, jsonObject.data + ':' + constants.api.PLUGINS, jsonObject.subRequest, function(response) {
				
			});
		
			break;
	}
};

WebsocketApiModule.prototype.handleLogLiveRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:
						
			dao.paginateRow(constants.values.CFLongType, jsonObject.data, jsonObject.subRequest, constants.values.PAGINATION, function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.LOG_LIVE, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			break;
	}
};

// Doesn't work
WebsocketApiModule.prototype.handleLogHistoryRequest = function(jsonObject) {	
	switch(jsonObject.type) {
		case constants.api.GET:

			dao.getRow(constants.values.CFLongType, utils.formatLogKey(jsonObject.data), function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.LOG_HISTORY, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			break;
	}
};

WebsocketApiModule.prototype.handlePluginLiveRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:

			dao.getRow(constants.values.CFLongType, jsonObject.data, function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.PLUGIN_LIVE, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			break;
	}
};

// Doesn't work
WebsocketApiModule.prototype.handlePluginHistoryRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:

			dao.getRow(constants.values.CFLongType, utils.formatPluginKey(jsonObject.data), function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.PLUGIN_HISTORY, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			break;
	}
};

WebsocketApiModule.prototype.handleAlertsLiveRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:
		
			dao.getRow(constants.values.CFLongType, utils.formatAlertKey(null), function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.ALERTS_LIVE, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			break;
	}
};

WebsocketApiModule.prototype.handleAlertsHistoryRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:

			dao.getRow(constants.values.CFLongType, utils.formatAlertKey(jsonObject.data), function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.ALERT_HISTORY, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			break;
	}
};

WebsocketApiModule.prototype.handleClientTagsRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:

			dao.getRow(constants.values.CFUTF8Type, constants.api.CLIENT_TAGS, function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.CLIENT_TAGS, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			
			var postParams = {};
   			postParams[jsonObject.data] = jsonObject.subRequest;
   		
   			dao.postDataUTF8Type(constants.api.CLIENT_TAGS, postParams);
   					
			break;
		case constants.api.DEL:
			break;
	}
};

WebsocketApiModule.prototype.handleClientExternalRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:
		
			dao.getRow(constants.values.CFUTF8Type, constants.api.CLIENT_EXTERNAL, function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.CLIENT_EXTERNAL, constants.api.GET, response, constants.values.SELF));
			});
			
			break;
		case constants.api.POST:
			break;
		case constants.api.DEL:
			break;
	}
};

WebsocketApiModule.prototype.handleMapReduceTableRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:
			break;
		case constants.api.POST:
		
			var postParams = {};
			
			if (jsonObject.subRequest == 'standard') {
				postParams['type'] = jsonObject.subRequest;
				postParams['rowMapping'] = 'rowkey';
				postParams['rowType'] = 'string';
			}
			
			if (jsonObject.subRequest == 'external') {
				// Deal with later
			}
			
			dao.mapReduceTable(jsonObject.data, postParams, function(response) {
				websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.MAPREDUCE_TABLE, constants.api.GET, response, constants.values.SELF));
			});
		
			break;
		case constants.api.DEL:
			break;
	}
};

WebsocketApiModule.prototype.handleMapReduceJobRequest = function(jsonObject) {
	switch(jsonObject.type) {
		case constants.api.GET:
			break;
		case constants.api.POST:
			
			logger.write(constants.levels.INFO, 'JOB REQUESTED ' + jsonObject.data);
			
			CloudsandraApi.mapReduceJob(postParams, function(response) {
				CloudsandraApi.parseForDisplay(response);
			});	
		
			break;
		case constants.api.DEL:
			break;
	}
};

WebsocketApiModule.prototype.getEC2Instances = function() {
	ec2.describeInstances(
		function (returnedInstanceObjects) {
			websocketObject.getWebsocketServer().broadcast(utils.formatWebsocketApiData(constants.api.INSTANCES, constants.api.GET, returnedInstanceObjects, constants.values.SELF));
		}
	);
};

exports.WebsocketApiModule = WebsocketApiModule;
