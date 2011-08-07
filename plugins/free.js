/**
 * df.js - plugin
 */
 
var fs = require('fs');

var modules = {
	
	daoManager: 'dao-manager',
	loggingManager: 'logging-manager'
	
};
  
var Plugin = {

	name: 'free',
	command: ''
		
};

Plugin.format = function (data) {

	/**
	* Take into account different systems
 	*/
	var system = Plugin.utilities.getSystemEnvironment();
	
	switch (system) {
 		case 'darwin':
 			Plugin.command = 'top -l 1 | awk \'/PhysMem/ {print $10}\'';
 			break;
 		case 'linux2':
 			break;
 		default:
 			Plugin.logger.write(Plugin.constants.levels.INFO, 'Unaccounted for system: ' + system);
 			break;
 	}

	data = data.replace(/(\r\n|\n|\r)/gm, '');
	data = data.replace('M', '')
	return data;
		
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
	
	/**
	* Take into account different systems
 	*/
 	var system = Plugin.utilities.getSystemEnvironment();
 	Plugin.logger.write(Plugin.constants.levels.INFO, 'System type: ' + system);
 	
 	switch (system) {
 		case 'darwin':
 			Plugin.command = 'top -l 1 | awk \'/PhysMem/ {print $10}\'';
 			break;
 		case 'linux2':
 			Plugin.command = 'free -t -m | awk \'NR==5{print $4}\'';
 			break;
 		default:
 			Plugin.logger.write(Plugin.constants.levels.INFO, 'Unaccounted for system: ' + system);
 			break;
 	}
	
	Plugin.logger.write(Plugin.constants.levels.INFO, 'Plugin command to run: ' + Plugin.command);

	var exec = require('child_process').exec, child;
	child = exec(Plugin.command, function (error, stdout, stderr) {		
	
		var data = Plugin.format(stdout.toString());
		
		Plugin.logger.write(Plugin.constants.levels.INFO, Plugin.name + ' Data: ' + data);
		Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: MemoryFree');
		Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: Megabytes');
		Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: ' + data);
				
		Plugin.dao.postCloudwatch('MemoryFree', 'Megabytes', data);
		
		callback(Plugin.name, key, data);
		
	});
	
};