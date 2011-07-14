/**
 * Plugin - filesize
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

// Filehandler
var filehandlerModule = require('../modules/filehandler');
var filehandler = new filehandlerModule.FilehandlerModule();
 
var Plugin = {
	name: 'filesize',
	config: require('../config/config')
};

this.name = Plugin.name;

Plugin.format = function(fileName, size) {

	output_hash = {
		date: new Date().getTime(),
		returned: {
			file: fileName,
			size: size * 1024
		}
	};
	return JSON.stringify(output_hash);
	
};

Plugin.cloudwatchCriteria = function(response, fileName) {
	
	params = {};
	
	params['Namespace'] = Plugin.config.cloudwatchNamespace;
	params['MetricData.member.1.MetricName'] = 'FileSize-' + fileName;
	params['MetricData.member.1.Unit'] = 'Kilobytes';
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
	var key = Plugin.config.clientIP + ':' + Plugin.name;
	var files = [];

	fs.readFile(Plugin.config.filesizeConfigFile, function (error, fd) {
		if (error)
			logger.write('Error reading file: ' + fileName);
			
		function fileCheck(name, sizeLimit) {
			this.name = name;
			this.sizeLimit = sizeLimit;
		}
			
		var status;
	  	var splitBuffer = [];
	  	splitBuffer = fd.toString().split('\n');
	  	
	  	for (i = 0; i < splitBuffer.length; i++) {
	  		var aFile = [];
	  		aFile = splitBuffer[i].split('=');
	  		
	  		logger.write(constants.levels.INFO, 'File name: ' + aFile[0]);
	  		logger.write(constants.levels.INFO, 'File size limit: ' + aFile[1]);
	
		  	files.push(new fileCheck(aFile[0], Number(aFile[1])));
	  	}  	 
	  		
		files.forEach(
			function(file) {
				
				var key = utils.formatPluginKey(Plugin.config.clientIP, Plugin.name);
			
				if (file.name == 'none' || file.name == '') {
					/**
					* Ignore empty file, probably a better way to do this...
					*/
				} else {
									  		
			    	fs.stat(file.name, function (error, stat) {
				    	if (error) {
				      		if (error.errno === process.ENOENT) {
				        		return;
				      		}
				      		return;
				    	}
				    	
				    	var key = utils.formatPluginKey(Plugin.config.clientIP, Plugin.name);
				    	var data = Plugin.format(file, stat.size);
				    	
				    	logger.write(constants.levels.INFO, Plugin.name + ' Data: ' + data);
				    	
				    	if (stat.size > file.sizeLimit) {
				    		Plugin.cloudwatchCriteria(stat.size, file.name);
				    		filehandler.empty(file.name);
				    	}
				    	
						callback(Plugin.name, key, data);
				    	
				  	});
				    	
				}  	
			}	
		);
	});
};