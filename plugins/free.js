/**
 * Plugin - free
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

// Cloudwatch
var REST = require('../modules/node-cloudwatch');
var client = new REST.AmazonCloudwatchClient();
 
var Plugin = {

	name: 'free',
	command: 'free -t -m | awk \'NR==5{print $4}\'',
	config: require('../config/config')
	
};

this.name = Plugin.name;

Plugin.format = function(data) {

	output_hash = {
		date: new Date().getTime(),
		value: data.replace('%', '')
	};
	return JSON.stringify(output_hash);
	
};

Plugin.cloudwatchCriteria = function(response) {
	
	params = {};
	
	params['Namespace'] = Plugin.config.cloudwatchNamespace;
	params['MetricData.member.1.MetricName'] = 'MemoryFree';
	params['MetricData.member.1.Unit'] = 'Megabytes';
	params['MetricData.member.1.Value'] = response;
	params['MetricData.member.1.Dimensions.member.1.Name'] = 'InstanceID';
	params['MetricData.member.1.Dimensions.member.1.Value'] = Plugin.config.instanceId;
	
	if (Plugin.config.cloudwatchEnabled) {
		client.request('PutMetricData', params, function (response) {
			logger.write(constants.levels.INFO, 'Amazon Response: ' + response);
		});
	}
	
	// logger.write(constants.levels.SEVERE, JSON.stringify(params));
	
};
	
this.poll = function (callback) {
	
	logger.write(constants.levels.INFO, 'Plugin command to run: ' + Plugin.command);

	var exec = require('child_process').exec, child;
	child = exec(Plugin.command, function (error, stdout, stderr) {		
		
		var key = utils.formatPluginKey(Plugin.config.clientIP, Plugin.name);
		var data = Plugin.format(stdout.toString());
		
		logger.write(constants.levels.INFO, Plugin.name + ' Data: ' + data);
		
		Plugin.cloudwatchCriteria(stdout.toString());
		
		console.log('Name: ' + Plugin.name + ' key: ' + key + ' data: ' + data);
		
		callback(Plugin.name, key, data);
	});
	
};