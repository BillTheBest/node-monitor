/**
 * uptime
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
	name: 'uptime',
	command: 'uptime',
	config: require('../config/config')
};

this.name = Plugin.name;

Plugin.format = function(data) {
	data = data.trim();
	data = data.replace('\n', '');
	data = data.replace(',', '');
	data = data.replace('up', '');
	data = data.replace('days', '');
	data = data.replace('users,', '');
	data = data.replace('load averages:', '');
	splitBuffer = data.split('\n');
	var output_array = data.replace(/^\s+|\s+$/g,'').split(/\s+/);
	var array_len = output_array.length;
	output_hash = {
		date: new Date().getTime(),
		days_up: output_array[array_len-6],
		time_went_up: output_array[array_len-5].replace(',', ''),
		current_user_sessions: output_array[array_len-4],
		load_average_1: output_array[array_len-3],
		load_average_5: output_array[array_len-2],
		load_average_15: output_array[array_len-1],
	}
	return JSON.stringify(output_hash);
};

Plugin.alertCriteria = function() {
	alert_hash = {
		current_user_sessions: JSON.stringify(json = {
					alert: {
						comparator: '>',
						value: 10
					}
				})
	};
	return JSON.stringify(alert_hash);
};

this.poll = function (callback) {	
	var exec = require('child_process').exec, child;
	child = exec(Plugin.command, function (error, stdout, stderr) {		
		var key = utils.formatPluginKey(Plugin.config.clientIP, Plugin.name);
		var data = Plugin.format(stdout.toString());
		logger.write(constants.levels.INFO, Plugin.name + ' Data: ' + data);
		callback(Plugin.name, key, data, Plugin.alertCriteria());
	});
};