/**
 * lsof.js - plugin
 */
 
var fs = require('fs');

var modules = {
	
	daoManager: 'dao-manager',
	loggingManager: 'logging-manager'
	
};
  
var Plugin = {

	name: 'lsof',
	command: 'lsof | wc -l'
		
};

Plugin.format = function (data) {

	data = data.replace(/(\r\n|\n|\r)/gm, '');
	data = data.replace('%', '')
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
	
	Plugin.logger.write(Plugin.constants.levels.INFO, 'Plugin command to run: ' + Plugin.command);

	var exec = require('child_process').exec, child;
	child = exec(Plugin.command, function (error, stdout, stderr) {		
		
		var key = Plugin.utilities.formatPluginKey(process.env['clientIP'], Plugin.name);
		var data = Plugin.format(stdout.toString());
		
		Plugin.logger.write(Plugin.constants.levels.INFO, Plugin.name + ' Data: ' + data);
		Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: OpenFiles');
		Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: Count');
		Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: ' + data);
				
		Plugin.dao.postCloudwatch('OpenFiles', 'Count', data);
		
		callback(Plugin.name, key, data);
		
	});
	
};