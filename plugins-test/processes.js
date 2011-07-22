/**
 * processes.js - plugin
 */
 
var fs = require('fs');

var dependencies = {

	net: 'net'

}; 

var modules = {
	
	daoManager: 'dao-manager',
	loggingManager: 'logging-manager'
	
};
  
var Plugin = {

	name: 'processes'
		
};

Plugin.format = function(response, processName) {

	var data = {
		
	}

	output_hash = {
		date: new Date().getTime(),
		returned:  {
			process: processName,
			status: response
		}
	};
	return JSON.stringify(output_hash);
	
};

Plugin.format = function(data) {

	var data = 

	output_hash = {
		date: new Date().getTime(),
		returned: data,
	};
	return JSON.stringify(output_hash);
	
};

Plugin.evaluateDeps = function(childDeps, self) {

	try {
  		process.chdir(process.env['moduleDirectory']);
	} catch (Exception) {
  		
  	}

	for (var name in dependencies) {
		eval('var ' + name + ' = require(\'' + dependencies[name] + '\')');
	}
	
	for (var name in modules) {
		eval('var ' + name + ' = require(\'' + modules[name] + '\')');
	}
	
	for (var name in childDeps) {
		eval('var ' + name + ' = require(\'' + childDeps[name] + '\')');
	}
	
	var utilities = new utilitiesManager.UtilitiesManagerModule(childDeps);
	var constants = new constantsManager.ConstantsManagerModule();
	var logger = new loggingManager.LoggingManagerModule(childDeps);
	var dao = new daoManager.DaoManagerModule(childDeps);

	self = this;
	
	self.constants = constants;
	self.utilities = utilities;
	self.constants = constants;
	self.dao = dao;
	self.logger = logger;
		
};

this.name = Plugin.name;

this.poll = function (childDeps, callback) {

	Plugin.evaluateDeps(childDeps, this);

	var key = process.env['clientIP'] + ':' + Plugin.name;
	var daemons = [];

	fs.readFile(process.env['daemonConfigFile'], function (error, fd) {
		
		if (error)
			Plugin.logger.write('Error reading file: ' + fileName);
			
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
	  		
	  		Plugin.logger.write(Plugin.constants.levels.INFO, 'Daemon name: ' + daemon[0]);
	  		Plugin.logger.write(Plugin.constants.levels.INFO, 'Daemon pid: ' + daemon[1]);
	
		  	daemons.push(new Daemon(daemon[0], Number(daemon[1])));
	  	}  	 
	  		
		daemons.forEach(
			function(daemon) {
				
				var key = Plugin.utilities.formatPluginKey(process.env['clientIP'], Plugin.name);
			
				if (daemon.name == 'none' || daemon.name == '' || daemon.name == undefined) {
					/**
					* Ignore empty file, or default of none
					*/
					Plugin.logger.write(Plugin.constants.levels.INFO, 'Ignoring bad daemon');
				} else {
					var stream = net.createConnection(daemon.port, process.env['clientIP']);
			
				  	var returnedSuccess = stream.on('connect', function() {	  		
				  		
				  		Plugin.dao.postCloudwatch('RunningProcess-' + daemon.name, 'None', 1);
				  		
				    	Plugin.logger.write(Plugin.constants.levels.INFO, '[' + daemon.name + '] connected');
				    	
						var data = Plugin.format('1');
						
    					Plugin.logger.write(Plugin.constants.levels.INFO, Plugin.name + ' Data: ' + data);
    					
						callback(Plugin.name, key, data);
				    	
				    	return;
				    	
				    	stream.end(); 
				    	
				  	});
				  	
				  	var returnedFail = stream.on('error', function(error) {
				  		
				  		if (error == 'Error: EINVAL, Invalid argument') {
				  			Plugin.logger.write(Plugin.constants.levels.INFO, 'Reading an invalid daemon, ignoring');
				  		} else {
				  			Plugin.dao.postCloudwatch('RunningProcess-' + daemon.name, 'None', 0);
				  			
				    		Plugin.logger.write(Pluign.constants.levels.SEVERE, '['+ daemon.name + '] : cant find process that should be running : ' + error);
				    		
				    		var data = Plugin.format('0');
				    		
    						Plugin.logger.write(Plugin.constants.levels.INFO, Plugin.name + ' Data: ' + data);
    						
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
	
	// logger.write(constants.levels.SEVERE, JSON.stringify(params));
	
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