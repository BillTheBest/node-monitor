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

	switch (request) {
		case constants.clientapi.COMMAND:
			this.handleCommandLineRequest(request);
			break;
		case constants.clientapi.CONFIG:
			this.handleConfigurationRequest(request);
			break;
		default:
			break;
	}
			
};

ClientapiManagerModule.prototype.handleCommandLineRequest = function(jsonObject) {

};

ClientapiManagerModule.prototype.handleConfigurationRequest = function(jsonObject) {

};


ClientapiManagerModule.prototype.handleDataRequest = function(data) {
	
	var assertObject = {
	};

	var jsonObject = utils.fromJSON(data);	
	var udefinedJsonObject = false;
	var undefinedAttribute = false;
	
	if (jsonObject != undefined) {
		/*
		 * When client disconnects, we must check message
		 */
		logger.write(constants.levels.INFO, 'JSON checks out');
		
		var name;
		if (jsonObject.name != undefined) {
			name = jsonObject.name.toString();
			logger.write(constants.levels.INFO, 'Name: ' + name);
		} else {
			logger.write(constants.levels.INFO, 'Undefined Name');
			undefinedAttribute = true;
		}
		
		var key;
		if (jsonObject.key != undefined) {
			key = jsonObject.key.toString();
			logger.write(constants.levels.INFO, 'Key: ' + key);
		} else {
			logger.write(constants.levels.INFO, 'Undefined Key');
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
		
		assertObject.name = name;
	 	assertObject.key = key;
	 	assertObject.message = message;
	 	assertObject.origin = origin;
	 	assertObject.destination = destination;
					
		if (undefinedAttribute == true) {
			/*
			 * Keep server from going down
			 */
			logger.write(constants.levels.INFO, 'Undefined attribute, ignoring');
			assertObject.assert = false;
		 	return assertObject;
		} else {
			/*
			 * Ok to store, check for bulk load?
			 */
			 
			
		 	logger.write(constants.levels.INFO, 'Storing message from node: ' + origin);
		 	assertObject.assert = true;
		 	return assertObject;
		}
	} else {
		logger.write(constants.levels.INFO, 'Undefined jsonObject, client probably disconnected or did something stupid');
		assertObject.assert = false;
		return assertObject;
	}
};

exports.ClientapiManagerModule = ClientapiManagerModule;