/* 
 * Log Monitor Module
 */
 
// Includes
var stack = require('../lib/long-stack-traces'),
	fs = require('fs'),
		step = require('../lib/step');

// Utilities
var utilsModule = require('./utils');
var utils = new utilsModule.UtilsModule();

// Global Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// Logging
var logger = require('./logger');

// Module Constants
var Module;
var NodeMonitorObject;

LogMonitorModule = function (clientMonitor) {
	NodeMonitorObject = clientMonitor;
	
	Module = this;
	Module.logMonitoring();
};

LogMonitorModule.prototype.logMonitoring = function() {		
	fs.readFile(NodeMonitorObject.config.logConfigFile, function (error, buffer, fd) {
		if (error) {
		
			logger.write(constants.levels.SEVERE, 'Error reading config file: ' + error.stack);
			
			return;
		}
		
	  	var splitBuffer = [];
	  	splitBuffer = buffer.toString().split('\n');
	  	
		for (i = 0; i < splitBuffer.length; i++) {
			logger.write(constants.levels.INFO, 'Found log in config: ' + splitBuffer[i]);
			
			var logName = splitBuffer[i];
			NodeMonitorObject.logsToMonitor.push(logName);

			if (logName == 'none' || '') {
				/**
				* Ignore empty file, probably a better way to do this...
				*/
			} else {
				var lookupKey = utils.formatLookupLogKey(NodeMonitorObject.config.clientIP);			
				NodeMonitorObject.sendDataLookup(lookupKey, logName);
			}
		}
		Module.asyncTailing();
	});
};

LogMonitorModule.prototype.asyncTailing = function() {	
	step(
		function tailAll() {
		    var self = this;
		    NodeMonitorObject.logsToMonitor.forEach(
		    	function(log) {
		    		if (log == 'none' || '') {
		    			/**
						* Ignore empty file, probably a better way to do this...
						*/
		    		} else {
			    		logger.write(constants.levels.INFO, 'Now tailing log: ' + log);
			      		Module.tailFile(log, self.parallel());
			      	}
		    	}
		    );
		 },
		 function finalize(error) {
		    	if (error) { 
		    		logger.write(constants.levels.SEVERE, 'Error tailing log file: ' + error);
		    		return;
		    	}
		  }
	);
};

LogMonitorModule.prototype.tailFile = function (logName, callback) {	
	var spawn = require('child_process').spawn;
	var tail = spawn('tail', ['-F', logName]);
    tail.stdout.on('data', function (data) {				
		var data = utils.format(constants.api.LOGS, data.toString());
		
		// Handle formatting and data pushing from main client
		
		// Always insert/upsert logs to keep track of them
		var lookupKey = utils.formatLookupLogKey(NodeMonitorObject.config.clientIP);
		NodeMonitorObject.sendDataLookup(lookupKey, logName);
		
		// Insert log data by day 
		var dataKey = utils.formatLogKey(NodeMonitorObject.config.clientIP, logName);
		NodeMonitorObject.sendData(constants.api.LOGS, dataKey, data);
	});
};

exports.LogMonitorModule = LogMonitorModule;