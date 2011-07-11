/**
 * Plugin - processes
 */
 
// Includes
var stack = require('../lib/long-stack-traces'),
		fs = require('fs'),
			net = require('net');

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
	name: 'processes',
	config: require('../config/config')
};

this.name = Plugin.name;

Plugin.format = function(response, processName) {

	output_hash = {
		date: new Date().getTime(),
		returned:  {
			process: processName,
			status: response
		}
	};
	return JSON.stringify(output_hash);
	
};

Plugin.cloudwatchCriteria = function(response, processName) {
	
	params = {};
	
	params['Namespace'] = Plugin.config.cloudwatchNamespace;
	params['MetricData.member.1.MetricName'] = 'RunningProcess-' + processName;
	params['MetricData.member.1.Unit'] = 'None';
	params['MetricData.member.1.Value'] = response;
	params['MetricData.member.1.Dimensions.member.1.Name'] = 'InstanceID';
	params['MetricData.member.1.Dimensions.member.1.Value'] = Plugin.config.instanceId;
	
	if (Plugin.config.cloudwatchEnabled) {
		client.request('PutMetricData', params, function (response) {
			logger.write(constants.levels.INFO, 'Amazon Response: ' + response);
		});
	}
	
	logger.write(constants.levels.SEVERE, JSON.stringify(params));
	
};

this.poll = function (callback) {
	var key = Plugin.config.clientIP + ':' + Plugin.name;
	var processes = [];

	fs.readFile(Plugin.config.processConfigFile, function (error, fd) {
		if (error)
			logger.write('Error reading file: ' + fileName);
			
		function Daemon(name) {
			this.name = name;
		}
			
		var status;
	  	var splitBuffer = [];
	  	splitBuffer = fd.toString().split('\n');
	  	
	  	for (i = 0; i < splitBuffer.length; i++) {
	  		var process = splitBuffer[i];
	  		
	  		logger.write(constants.levels.INFO, 'Process name: ' + process);
	
		  	processes.push(process);
	  	}  	 
	  		
		processes.forEach(
			function(process) {
				
				var key = utils.formatPluginKey(Plugin.config.clientIP, Plugin.name);
			
				if (process == 'none' || process == '') {
					/**
					* Ignore empty file, probably a better way to do this...
					*/
				} else {
				
					Plugin.command = 'ps ax | grep -v grep | grep -v tail | grep ' + process;

					logger.write(constants.levels.INFO, 'Plugin command to run: ' + Plugin.command);
				
					var exec = require('child_process').exec, child;
					child = exec(Plugin.command, function (error, stdout, stderr) {		
						
						var key = utils.formatPluginKey(Plugin.config.clientIP, Plugin.name);
						
						var data;
						if (stdout.toString() == '') {
							
							logger.write(constants.levels.INFO, process + ' is not running!');
						
							data = Plugin.format('0', process);
							Plugin.cloudwatchCriteria('0', process);
							
						} else {
							
							logger.write(constants.levels.INFO, process + ' is running');
						
							data = Plugin.format('1', process);
							Plugin.cloudwatchCriteria('1', process);
							
						}
										
						logger.write(constants.levels.INFO, Plugin.name + ' Data: ' + data);
						
						callback(Plugin.name, key, data);
					});
				}	
			}
		);
	});
};