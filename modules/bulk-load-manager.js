/* 
 * Bulk Load Manager Module
 */
 
// Includes
var stack = require('../lib/long-stack-traces'),
	fs = require('fs');

// Utilities
var utilsModule = require('./utils');
var utils = new utilsModule.UtilsModule();

// Logging
var logger = require('./logger');

// Failsafe
var failsafe = require('../modules/failsafe');

// Global Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// Module Constants
var Module;
var BulkLoadModuleObject;

BulkLoadModule = function (clientMonitor) {
	NodeMonitorObject = clientMonitor;
	
	Module = this;
	Module.bulkPost();
};

BulkLoadModule.prototype.bulkPost = function() {
	if (NodeMonitorObject.config.bulk_interval)
		clearInterval(NodeMonitorObject.config.bulk_interval);
	
	NodeMonitorObject.config.bulk_interval = setInterval(
		function() {
			logger.write(constants.levels.INFO, 'Making a bulk post from the commit_log');
			failsafe.purge(NodeMonitorObject);
		}, 
		NodeMonitorObject.config.timeToPost
	);
};

exports.BulkLoadModule = BulkLoadModule;