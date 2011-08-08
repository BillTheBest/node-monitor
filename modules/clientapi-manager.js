/**
 * clientapi-manager.js module
 */
 	
var fs = require('fs'); 
 
var modules = {

	filehandlerManager: 'filehandler-manager',
	loggingManager: 'logging-manager'

};

var Module = {};

ClientapiManagerModule = function (childDeps) {

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

	Module = this;
	
	Module.utilities = utilities;
	Module.constants = constants;
	Module.logger = logger;
	
	Module.childDeps = childDeps;
					
}; 

/**
* Handle requests that are made from the UI => Server => Client,
* then execute, then send a response back to the UI
*/
ClientapiManagerModule.prototype.handleRequest = function (request) {

	var assertObject = handleDataRequest(request);

	switch (assertObject.request) {
		case constants.clientapi.COMMAND_STOP_TAILING:
			
			break;
		case constants.clientapi.COMMAND_START_TAILING:
		
			break;
		case constants.clientapi.COMMAND_UPLOAD_PLUGIN:
		
			break;
		case constants.clientapi.COMMAND_REMOVE_PLUGIN:
		
			break;
		case constants.clientapi.COMMAND_ADD_CONFIG:
		
			break;
		case constants.clientapi.COMMAND_REMOVE_CONFIG:
		
			break;
		case constants.clientapi.COMMAND_UPDATE_CONFIG:
		
			break;
	}
			
};

ClientapiManagerModule.prototype.handleStopTailingRequest = function(jsonObject) {

};

ClientapiManagerModule.prototype.handleStartTailingRequest = function(jsonObject) {

};

ClientapiManagerModule.prototype.handleUploadPluginRequest = function(jsonObject) {

};

ClientapiManagerModule.prototype.handleRemovePluginRequest = function(jsonObject) {

};

ClientapiManagerModule.prototype.handleAddConfigRequest = function(jsonObject) {

};

ClientapiManagerModule.prototype.handleRemoveConfigRequest = function(jsonObject) {

};

ClientapiManagerModule.prototype.handleUpdateConfigRequest = function(jsonObject) {

};

ClientapiManagerModule.prototype.handleDataRequest = function(data) {
	
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
			logger.write(constants.levels.INFO, 'Data/Message: ' + message);
		} else {
			logger.write(constants.levels.INFO, 'Undefined Data/Message');
			undefinedAttribute = true;
		}

		var origin;	
		if (jsonObject.origin != undefined) {
			origin = jsonObject.origin.toString();
			logger.write(constants.levels.INFO, 'Origin: ' + origin);
		} else {
			logger.write(constants.levels.INFO, 'Undefined Origin');
			undefinedAttribute = true;
		}
		
		var destination;	
		if (jsonObject.destination != undefined) {
			destination = jsonObject.destination.toString();
			logger.write(constants.levels.INFO, 'Destination: ' + destination);
		} else {
			logger.write(constants.levels.INFO, 'Undefined Destination');
			undefinedAttribute = true;
		}
		
		assertObject.type = type;
	 	assertObject.request = request;
	 	assertObject.message = message;
	 	assertObject.origin = origin;
	 	assertObject.target = destination;
					
		if (undefinedAttribute == true) {
			logger.write(constants.levels.INFO, 'Undefined attribute, ignoring');
			assertObject.assert = false;
		 	return assertObject;
		} else {
		 	assertObject.assert = true;
		 	return assertObject;
		}
	} else {
		logger.write(constants.levels.INFO, 'Undefined jsonObject, server probably did something stupid');
		assertObject.assert = false;
		return assertObject;
	}
};

exports.ClientapiManagerModule = ClientapiManagerModule;