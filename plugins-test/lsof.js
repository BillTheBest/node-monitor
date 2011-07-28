/**
 * Plugin - lsof
 */
 
// Includes
var stack = require('../lib/long-stack-traces');

// Utilities
var utilsModule = require('../modules/utils');
var utils = new utilsModule.UtilsModule();

// Constants
var constantsModule = require('../modules/constants');
var constants = new constantsModule.ConstantsModule();

// Logging
var logger = require('../modules/logger');
 
var Plugin = {
	name: 'lsof',
	command: 'lsof | wc -l',
	config: require('../config/config')
};

this.name = Plugin.name;

Plugin.format = function(data) {
	
	data = data.replace(/(\r\n|\n|\r)/gm, '');

	return data;
	
};

this.poll = function (callback) {	
	var exec = require('child_process').exec, child;
	child = exec(Plugin.command, function (error, stdout, stderr) {		
		
		var key = utils.formatPluginKey(Plugin.config.clientIP, Plugin.name);
		var data = Plugin.format(stdout.toString());
		
		logger.write(constants.levels.INFO, Plugin.name + ' Data: ' + data);
		
		callback(Plugin.name, key, data);
	});
};