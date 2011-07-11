/* 
 * Kepe Alive Manager Module
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

// DAO
var daoModule = require('../modules/dao');
var dao = new daoModule.DAOModule();

// Global Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// Module Constants
var Module;
var KeepAliveModuleObject;

KeepAliveModule = function (clientMonitor) {
	NodeMonitorObject = clientMonitor;
	
	Module = this;
	Module.keepAlive();
};

KeepAliveModule.prototype.keepAlive = function() {
	if (NodeMonitorObject.config.keepalive_interval)
		clearInterval(NodeMonitorObject.config.keepalive_interval);
	
	NodeMonitorObject.config.keepalive_interval = setInterval(
		function() {
			logger.write(constants.levels.INFO, 'Sending keep alive');
			
			dao.storeSelf(constants.api.CLIENTS, NodeMonitorObject.config.clientIP, NodeMonitorObject.config.externalIP);			
		}, 
		1000 * 60 * 5
	);
};

exports.KeepAliveModule = KeepAliveModule;