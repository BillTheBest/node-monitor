/**
 * websocketapi-manager.js module
 */
 
var fs = require('fs'); 
 
var modules = {
	
	loggingManager: 'logging-manager',
	daoManager: 'dao-manager',
	filehandlerManager: 'filehandler-manager',
	ec2Manager: 'ec2-manager',
	commandManager: 'command-manager'

};

var Module = {};
var MonitorServerObject;

WebsocketapiManagerModule = function (MonitorServer, websocketConn, childDeps) {

	try {
  		process.chdir(process.env['moduleDirectory']);
	} catch (Exception) {
  		
  	}

	for (var name in modules) {
		eval('var ' + name + ' = require(\'' + modules[name] + '\')');
	}
	
	for (var name in childDeps) {
		eval('var ' + name + ' = require(\'' + childDeps[name] + '\')');
	}
	
	var utilities = new utilitiesManager.UtilitiesManagerModule(childDeps);
	var constants = new constantsManager.ConstantsManagerModule();
	var logger = new loggingManager.LoggingManagerModule(childDeps);
	var dao = new daoManager.DaoManagerModule(childDeps);
	var filehandler = new filehandlerManager.FilehandlerManagerModule(childDeps);
	var ec2 = new ec2Manager.EC2ManagerModule(childDeps);
	var commandManager = new commandManager.CommandManagerModule(childDeps);

	Module = this;
	MonitorServerObject = MonitorServer;
	
	Module.utilities = utilities;
	Module.constants = constants;
	Module.logger = logger;
	Module.dao = dao;
	Module.filehandler = filehandler;
	Module.ec2 = ec2;
	Module.commandManager = commandManager;
	
	Module.websocket = new Module.websocketServer(websocketConn);
		
}; 

WebsocketapiManagerModule.prototype.websocketServer = function (val) {

	var value = val;
    
    this.getWebsocketServer = function(){
        return value;
    };
    
    this.setWebsocketServer = function(val){
        value = val;
    };
    
};

WebsocketapiManagerModule.prototype.handleRequest = function (data) {
	
	Module.logger.write(Module.constants.levels.INFO, 'Handling Websocket API request: ' + data);
	
	var assertObject = {
	
	};

	var jsonObject = Module.utilities.fromJSON(data);	
	var udefinedJsonObject = false;
	var undefinedAttribute = false;
	
	if (jsonObject != undefined) {
	
		Module.logger.write(Module.constants.levels.INFO, 'JSON checks out');
		
		var type;
		if (jsonObject.type != undefined) {
			type = jsonObject.type.toString();
			Module.logger.write(Module.constants.levels.INFO, 'Type: ' + type);
		} else {
			Module.logger.write(Module.constants.levels.INFO, 'Undefined Type');
			undefinedAttribute = true;
		}
		
		var request;
		if (jsonObject.request != undefined) {
			request = jsonObject.request.toString();
			Module.logger.write(Module.constants.levels.INFO, 'Request: ' + request);
		} else {
			Module.logger.write(Module.constants.levels.INFO, 'Undefined Request');
			undefinedAttribute = true;
		}
		
		var message;
		if (jsonObject.data != undefined) {
			message = jsonObject.data.toString();
			Module.logger.write(Module.constants.levels.INFO, 'Message: ' + message);
		} else {
			Module.logger.write(Module.constants.levels.INFO, 'Undefined Data');
			undefinedAttribute = true;
		}
		
		assertObject.type = type;
	 	assertObject.request = request;
	 	assertObject.message = message;
		
		var subRequest;	
		if (jsonObject.subRequest != undefined) {
			subRequest = jsonObject.subRequest.toString();
			assertObject.subRequest = subRequest;
			Module.logger.write(Module.constants.levels.INFO, 'Sub Request: ' + subRequest);
		} else {
			Module.logger.write(Module.constants.levels.INFO, 'Undefined Sub Request');
		}
					
		if (undefinedAttribute) {
			Module.logger.write(Module.constants.levels.INFO, 'Undefined attribute, ignoring');
			assertObject.assert = false;
		} else {
		 	assertObject.assert = true;
		}
	} else {
		Module.logger.write(Module.constants.levels.INFO, 'Undefined jsonObject, user probably made a bad request');
		assertObject.assert = false;
	}
	
	if (assertObject.assert) {			
		switch(request) {	
			/**
			* If we send a command from websocket to server that is not data based, but command based
			*/
			case Module.constants.api.COMMAND:
				/**
				* TYPE Module.constants.api.COMMAND
				* REQ Module.constants.api.COMMAND_START_TAILING
				* DATA logfileName
				* SUB REQUEST internal IP of node
				*
				*/ 
				MonitorServer.stream.write(utilities.formatClientApiData(type, request, message, process.env['serverIP'], subRequest));
				break;
			/**
			* Data requests
			*/
			case Module.constants.api.SERVER:
				this.handleServerRequest(jsonObject);
				break;
			case Module.constants.api.USERS:
				this.handleUsersRequest(jsonObject);
				break;
			case Module.constants.api.CLIENTS:
				this.handleClientsRequest(jsonObject);
				break;
			case Module.constants.api.INSTANCES:
				this.handleInstancesRequest(jsonObject);
				break;
			case Module.constants.api.LOGS:
				this.handleLogsRequest(jsonObject);
				break;
			case Module.constants.api.PLUGINS:
				this.handlePluginsRequest(jsonObject);
				break;
			case Module.constants.api.LOG_LIVE:
				this.handleLogLiveRequest(jsonObject);
				break;
			case Module.constants.api.LOG_HISTORY:
				this.handleLogHistoryRequest(jsonObject);
				break;
			case Module.constants.api.PLUGIN_LIVE:
				this.handlePluginLiveRequest(jsonObject);
				break;
			case Module.constants.api.PLUGIN_HISTORY:
				this.handlePluginHistoryRequest(jsonObject);
				break;
			case Module.constants.api.ALERTS_LIVE:
				this.handleAlertsLiveRequest(jsonObject);
				break;
			case Module.constants.api.ALERTS_HISTORY:
				this.handleAlertsHistoryRequest(jsonObject);
				break;
			case Module.constants.api.CLIENT_TAGS:
				this.handleClientTagsRequest(jsonObject);
				break;
			case Module.constants.api.CLIENT_EXTERNAL:
				this.handleClientExternalRequest(jsonObject);
				break;
			case Module.constants.api.MAPREDUCE_TABLE:
				this.handleMapReduceTableRequest(jsonObject);
				break;
			case Module.constants.api.MAPREDUCE_JOB:
				this.handleMapReduceTableRequest(jsonObject);
				break;
		}
	}
	
};

WebsocketapiManagerModule.prototype.handleServerRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:

			Module.dao.getRow(Module.constants.values.CFUTF8Type, Module.constants.api.SERVER, function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.SERVER, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handleUsersRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:
	
			Module.dao.getRow(Module.constants.values.CFUTF8Type, Module.constants.api.USERS, function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.USERS, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			/* 
			 * Delete user on refresh of page - call doesn't exist yet
			 */
			/*
			var deleteParams = {};
	   		deleteParams[conn.id] = Module.utilities.generateFormattedDate();
			CloudsandraApi.postData(Module.constants.values.CF, Module.constants.api.USERS, postParams, function(response) {
				CloudsandraApi.parseForDisplay(response);
			});
			*/
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handleClientsRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:

			Module.dao.getRow(Module.constants.values.CFUTF8Type, Module.constants.api.CLIENTS, function(response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.CLIENTS, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			
			Module.dao.deleteDataFromRow(Module.constants.values.CFUTF8Type, Module.constants.api.CLIENTS, jsonObject.data, function(response) {
				
			});
		
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handleInstancesRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:
			this.getEC2Instances();
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handleLogsRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:

			Module.dao.getRow(Module.constants.values.CFUTF8Type, jsonObject.data + ':' + Module.constants.api.LOGS, function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.LOGS, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handlePluginsRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:

			Module.dao.getRow(Module.constants.values.CFUTF8Type, jsonObject.data + ':' + Module.constants.api.PLUGINS, function(response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.PLUGINS, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			
			Module.dao.deleteDataFromRow(Module.constants.values.CFUTF8Type, jsonObject.data + ':' + Module.constants.api.PLUGINS, jsonObject.subRequest, function (response) {
				
			});
		
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handleLogLiveRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:
						
			Module.dao.paginateRow(Module.constants.values.CFLongType, jsonObject.data, jsonObject.subRequest, Module.constants.values.PAGINATION, function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.LOG_LIVE, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

// Doesn't work
WebsocketapiManagerModule.prototype.handleLogHistoryRequest = function (jsonObject) {	

	switch(jsonObject.type) {
		case Module.constants.api.GET:

			Module.dao.getRow(Module.constants.values.CFLongType, Module.utilities.formatLogKey(jsonObject.data), function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.LOG_HISTORY, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handlePluginLiveRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:

			Module.dao.getRow(Module.constants.values.CFLongType, jsonObject.data, function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.PLUGIN_LIVE, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

// Doesn't work
WebsocketapiManagerModule.prototype.handlePluginHistoryRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:

			Module.dao.getRow(Module.constants.values.CFLongType, Module.utilities.formatPluginKey(jsonObject.data), function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.PLUGIN_HISTORY, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handleAlertsLiveRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:
		
			Module.dao.getRow(Module.constants.values.CFLongType, Module.utilities.formatAlertKey(null), function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.ALERTS_LIVE, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handleAlertsHistoryRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:

			Module.dao.getRow(Module.constants.values.CFLongType, Module.utilities.formatAlertKey(jsonObject.data), function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.ALERT_HISTORY, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handleClientTagsRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:

			Module.dao.getRow(Module.constants.values.CFUTF8Type, Module.constants.api.CLIENT_TAGS, function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.CLIENT_TAGS, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			
			var postParams = {};
   			postParams[jsonObject.data] = jsonObject.subRequest;
   		
   			Module.dao.postDataUTF8Type(Module.constants.api.CLIENT_TAGS, postParams);
   					
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handleClientExternalRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:
		
			Module.dao.getRow(Module.constants.values.CFUTF8Type, Module.constants.api.CLIENT_EXTERNAL, function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.CLIENT_EXTERNAL, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
			
			break;
		case Module.constants.api.POST:
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handleMapReduceTableRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:
			break;
		case Module.constants.api.POST:
		
			var postParams = {};
			
			if (jsonObject.subRequest == 'standard') {
				postParams['type'] = jsonObject.subRequest;
				postParams['rowMapping'] = 'rowkey';
				postParams['rowType'] = 'string';
			}
			
			if (jsonObject.subRequest == 'external') {
				// Deal with later
			}
			
			Module.dao.mapReduceTable(jsonObject.data, postParams, function (response) {
				Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.MAPREDUCE_TABLE, Module.constants.api.GET, response, Module.constants.values.SELF));
			});
		
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

WebsocketapiManagerModule.prototype.handleMapReduceJobRequest = function (jsonObject) {

	switch(jsonObject.type) {
		case Module.constants.api.GET:
			break;
		case Module.constants.api.POST:
			
			Module.logger.write(Module.constants.levels.INFO, 'JOB REQUESTED ' + jsonObject.data);
			
			CloudsandraApi.mapReduceJob(postParams, function(response) {
				CloudsandraApi.parseForDisplay(response);
			});	
		
			break;
		case Module.constants.api.DEL:
			break;
	}
	
};

WebsocketapiManagerModule.prototype.getEC2Instances = function() {

	Module.ec2.describeInstances(
		function (returnedInstanceObjects) {
			Module.websocket.getWebsocketServer().broadcast(Module.utilities.formatWebsocketApiData(Module.constants.api.INSTANCES, Module.constants.api.GET, returnedInstanceObjects, Module.constants.values.SELF));
		}
	);
	
};

exports.WebsocketapiManagerModule = WebsocketapiManagerModule;
