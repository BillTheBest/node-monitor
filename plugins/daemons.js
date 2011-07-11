/**
 * Plugin - daemons
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

	name: 'daemons',
	config: require('../config/config')
	
};

this.name = Plugin.name;

Plugin.format = function(data) {

	output_hash = {
		date: new Date().getTime(),
		returned: data,
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
	var daemons = [];

	fs.readFile(Plugin.config.daemonConfigFile, function (error, fd) {
		if (error)
			logger.write('Error reading file: ' + fileName);
			
		function Daemon(name, port) {
			this.name = name;
			this.port = port;
		}
			
		var status;
	  	var splitBuffer = [];
	  	splitBuffer = fd.toString().split('\n');
	  	
	  	for (i = 0; i < splitBuffer.length; i++) {
	  		var daemon = [];
	  		daemon = splitBuffer[i].split('=');
	  		
	  		logger.write(constants.levels.INFO, 'Daemon name: ' + daemon[0]);
	  		logger.write(constants.levels.INFO, 'Daemon pid: ' + daemon[1]);
	
		  	daemons.push(new Daemon(daemon[0], Number(daemon[1])));
	  	}  	 
	  		
		daemons.forEach(
			function(daemon) {
				
				var key = utils.formatPluginKey(Plugin.config.clientIP, Plugin.name);
			
				if (daemon.name == 'none' || daemon.name == '') {
					/**
					* Ignore empty file, probably a better way to do this...
					*/
				} else {
					var stream = net.createConnection(daemon.port, Plugin.config.clientIP);
			
				  	var returnedSuccess = stream.on('connect', function() {
				  		
				  		Plugin.cloudwatchCriteria('1', daemon.name);
				    	logger.write(constants.levels.INFO, '[' + daemon.name + '] connected');
				    	
						var data = Plugin.format('1');
    					logger.write(constants.levels.INFO, Plugin.name + ' Data: ' + data);
						callback(Plugin.name, key, data);
				    	
				    	return;
				    	
				    	stream.end(); 
				    	
				  	});
				  	
				  	var returnedFail = stream.on('error', function(error) {
				  		
				  		if (error == 'Error: EINVAL, Invalid argument') {
				  			logger.write(constants.levels.INFO, 'Reading an invalid daemon, ignoring');
				  		} else {
				  			Plugin.cloudwatchCriteria('0', daemon.name);
				    		logger.write(constants.levels.SEVERE, '['+ daemon.name + '] : cant find process that should be running : ' + error);
				    		
				    		var data = Plugin.format('0');
    						logger.write(constants.levels.INFO, Plugin.name + ' Data: ' + data);
							callback(Plugin.name, key, data);
				  		}	
				  		    	
				    	return;
				    	
				    	stream.destroy(); 
				    	
				  	});
				}	
			}
		);
	});
};