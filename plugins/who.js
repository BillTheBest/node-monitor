/**
 * who.js - plugin
 */
 
var fs = require('fs');

var modules = {
	
	daoManager: 'dao-manager',
	loggingManager: 'logging-manager'
	
};
  
var Plugin = {

	name: 'who',
	command: 'who'
		
};

Plugin.format = function (data) {
	
	var splitBuffer = [];
	splitBuffer = data.split('\n');
	
	var users = {
	
	};
	
	for (i = 0; i < splitBuffer.length; i++) {
		var line = splitBuffer[i];
		var lineArray = line.split(/\s+/);
		
		var count = 0;
		var userName;
		var sessionName;
		
		lineArray.forEach(
			function (segment) {
				if (count == 0)
					userName = segment;
	
				if (count == 1) {
					var sessionName = segment;
					var consoleCount;
					if (users[userName]) {
						consoleCount = parseInt(users[userName]['sessions']);
						consoleCount++;
					} else {
						consoleCount = 1;
						users[userName] = {};
						users[userName]['username'] = userName;
						users[userName]['type'] = [];
					}
					users[userName]['sessions'] = consoleCount;
					users[userName]['type'].push(sessionName);
				}
				count++;
			}
		);
	}
	
	for (var user in users) {
    	Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: Who-' + users[user]['username']);
		Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: Count');
		Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: ' + users[user]['sessions']);
				
		Plugin.dao.postCloudwatch('Who-' + users[user]['username'], 'Count', users[user]['sessions']);
    	users[user]['type'].forEach(
    		function (session) {
    			/**
    			* Do nothing with this yet, could check for a specific type in CloudWatch
    			*/
    		}
    	);
    		
	}
	
	return JSON.stringify(users);
		
};

this.name = Plugin.name;

Plugin.evaluateDeps = function (childDeps, self) {

	try {
  		process.chdir(process.env['moduleDirectory']);
	} catch (Exception) {
  		
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
	
	Plugin.logger.write(Plugin.constants.levels.INFO, 'Plugin command to run: ' + Plugin.command);

	var exec = require('child_process').exec, child;
	child = exec(Plugin.command, function (error, stdout, stderr) {		
		
		var data = Plugin.format(stdout.toString());
			
		callback(Plugin.name, key, data);
		
	});
	
};