/**
 * Plugin Template
 *
 * TODO:
 * Need to add charts config, better alert mech (e.g. time to notify, specific alert message), amount of time to execute?
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
 
/**
* Plugin configuration
* name: The name of the plugin, easiest to map to command
* command: The command to execute on command line (how many times can I say command?)
*/
var Plugin = {
	name: 'lsof',
	command: 'lsof | wc -l',
	config: require('../config/config')
};

this.name = Plugin.name;

/**
* This is the JSON formatted value that the plugin returns, 
* with a relatively simple example below
*/
Plugin.format = function(data) {
	data = data.trim();
	data = data.replace('\n', '');
	output_hash = {
		date: new Date().getTime(),
		value: data
	};
	return JSON.stringify(output_hash);
};

/**
* Based on the above JSON, we can specify a realtime alert system, 
* and POST an alert if we don't meet the criterion
*/
Plugin.alertCriteria = function() {
	alert_hash = {
		returned: JSON.stringify(json = {
					alert: {
						comparator: '>',
						value: 5000
					}
				})
	};
	return JSON.stringify(alert_hash);
};

/**
* This is an async request that let's us spawn a process to perform the command,
* which we return to the plugin manager who checks alert criteria, and appends
* to the bulk post que
*/
this.poll = function (callback) {	
	var exec = require('child_process').exec, child;
	child = exec(Plugin.command, function (error, stdout, stderr) {		
		var key = utils.formatPluginKey(Plugin.config.clientIP, Plugin.name);
		var data = Plugin.format(stdout.toString());
		logger.write(constants.levels.INFO, Plugin.name + ' Data: ' + data);
		callback(Plugin.name, key, data, Plugin.alertCriteria());
	});
};