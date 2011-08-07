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

	name: 'processes',
	command: ''
		
};

Plugin.format = function(response, processName) {

	data = {
		process: processName,
		status: response
	};
	
	return JSON.stringify(data);
	
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

	var key = Plugin.utilities.formatPluginKey(process.env['clientIP'], Plugin.name);
	var processes = [];

	fs.readFile(process.env['processConfigFile'], function (error, fd) {
		
		if (error)
			Plugin.logger.write('Error reading file: ' + fileName);
			
		var splitBuffer = [];
	  	splitBuffer = fd.toString().split('\n');
			
		for (i = 0; i < splitBuffer.length; i++) {

	  		var process = splitBuffer[i];
	  		
	  		Plugin.logger.write(Plugin.constants.levels.INFO, 'Process to check: ' + process);
	  		
	  		if (process == '' || process == 'none' || process == 'undefined') {
	  			/**
				* Ignore empty file, or default of none
				*/
	  		} else {
	  			processes.push(process);
	  		}

	  	}  	
	  	
	  	processes.forEach(
			function (processToCheck) {
				Plugin.command = 'ps ax | grep -v grep | grep -v tail | grep ' + processToCheck;
				
				var exec = require('child_process').exec, child;
				child = exec(Plugin.command, function (error, stdout, stderr) {		
					
					var data;
					
					Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: RunningProcess-' + processToCheck);
					Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: None');
					
					if (stdout.toString() == '') {
							
						Plugin.logger.write(Plugin.constants.levels.INFO, processToCheck + ' is not running!');
						data = Plugin.format('0', processToCheck);
						Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: 0');
						Plugin.dao.postCloudwatch('RunningProcess-' + processToCheck, 'None', '0');
						
					} else {
						
						Plugin.logger.write(Plugin.constants.levels.INFO, processToCheck + ' is running!');
						data = Plugin.format('1', processToCheck);
						Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: 1');
						Plugin.dao.postCloudwatch('RunningProcess-' + processToCheck, 'None', '1');
						
					}
						
					callback(Plugin.name, key, data);
				});
			}
		);
	});
};