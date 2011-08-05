/**
 * df.js - plugin
 */
 
var fs = require('fs');

var modules = {
	
	daoManager: 'dao-manager',
	loggingManager: 'logging-manager'
	
};
  
var Plugin = {

	name: 'df',
	command: ''
		
};

Plugin.format = function (data) {
	
	data = data.replace(/(\r\n|\n|\r)/gm, '');
	data = data.replace('%', '')
	return data;
		
};

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
	
	var disks = [];

	fs.readFile(process.env['diskConfigFile'], function (error, fd) {
		
		if (error)
			Plugin.logger.write('Error reading file: ' + fileName);
	 
	  	var splitBuffer = [];
	  	splitBuffer = fd.toString().split('\n');
	  	
	  	for (i = 0; i < splitBuffer.length; i++) {

	  		var disk = splitBuffer[i];
	  		
	  		Plugin.logger.write(Plugin.constants.levels.INFO, 'Disk to check: ' + disk);
	  		
	  		if (disk == '' || disk == 'none' || disk == 'undefined') {
	  			/**
				* Ignore empty file, or default of none
				*/
	  		} else {
	  			disks.push(disk);
	  		}

	  	}  	 
	  		
		disks.forEach(
			function (diskToCheck) {
				Plugin.command = 'df -h | grep \'' + diskToCheck + '\' | awk \'{print $5}\'';
				
				var exec = require('child_process').exec, child;
				child = exec(Plugin.command, function (error, stdout, stderr) {		
					
					var key = Plugin.utilities.formatPluginKey(process.env['clientIP'], Plugin.name);
					var data = Plugin.format(stdout.toString());
					
					Plugin.logger.write(Plugin.constants.levels.INFO, Plugin.name + ' Data: ' + data);
					Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: DiskSpace');
					Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: Percent');
					Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: ' + data);
							
					Plugin.dao.postCloudwatch('DiskSpace', 'Percent', stdout.toString().replace('%', ''));
					
					callback(Plugin.name, key, data);
				});
			}
		);
		
	});
	
};