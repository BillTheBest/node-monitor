/**
* Client API Module
*/

// Includes
var stack = require('../lib/long-stack-traces');

// Utilities
var utilsModule = require('../modules/utils');
var utils = new utilsModule.UtilsModule();
var filehandler = require('../modules/filehandler.js');
 
// Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// Config
var config = require('../config/config');

// Logging
var logger = require('./logger');

ClientApiModule = function() {

};

ClientApiModule.prototype.handleServerRequest = function(request) {

};

ClientApiModule.prototype.handleDataRequest = function(data) {
	
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

exports.ClientApiModule = ClientApiModule;