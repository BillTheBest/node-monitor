/**
 * filesize - plugin
 */
 
var fs = require('fs');

var modules = {
	
	daoManager: 'dao-manager',
	loggingManager: 'logging-manager',
	filehandlerManager: 'filehandler-manager'
	
};
  
var Plugin = {

	name: 'filesize',
	command: ''
		
};

Plugin.format = function (fileName, fileSize) {

	fileName = fileName.replace(/(\r\n|\n|\r)/gm, '');
	fileSize = fileSize.toString().replace(/(\r\n|\n|\r)/gm, '');
	
	fileSize = Number(fileSize) * 1024;

	var data = {
	
		file: fileName,
		size: fileSize.toString()
	
	}

	output_hash = {
		date: new Date().getTime(),
		returned: data
	};
	return JSON.stringify(output_hash);
	
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
	var filehandler = new filehandlerManager.FilehandlerManagerModule(childDeps);

	self = this;
	
	self.constants = constants;
	self.utilities = utilities;
	self.constants = constants;
	self.filehandler = filehandler;
	self.dao = dao;
	self.logger = logger;
		
};

this.name = Plugin.name;

this.poll = function (childDeps, callback) {

	Plugin.evaluateDeps(childDeps, this);
	
	var key = process.env['clientIP'] + ':' + Plugin.name;
	var files = [];

	fs.readFile(process.env['filesizeConfigFile'], function (error, fd) {
		
		if (error)
			Plugin.logger.write('Error reading file: ' + fileName);
			
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
	  		
	  		Plugin.logger.write(Plugin.constants.levels.INFO, 'File name: ' + aFile[0]);
	  		Plugin.logger.write(Plugin.constants.levels.INFO, 'File size limit: ' + aFile[1]);
	
		  	files.push(new fileCheck(aFile[0], Number(aFile[1])));
	  	}  	 
	  		
		files.forEach(
			function(file) {
				
				var key = Plugin.utilities.formatPluginKey(process.env['clientIP'], Plugin.name);
			
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
				    	
				    	var key = Plugin.utilities.formatPluginKey(process.env['clientIP'], Plugin.name);
				    	var data = Plugin.format(file.name, stat.size);
				    	
				    	Plugin.logger.write(Plugin.constants.levels.INFO, Plugin.name + ' Data: ' + data);
				    	
				    	Plugin.logger.write(Plugin.constants.levels.INFO, 'stat.size: ' + stat.size);
				    	Plugin.logger.write(Plugin.constants.levels.INFO, 'file.sizeLimit: ' +  file.sizeLimit);
				    	
				    	if (Number(stat.size) > Number(file.sizeLimit)) {
					
							Plugin.logger.write('Emptying file, it exceeds limit');
				    		Plugin.dao.postCloudwatch('FileSize-' + file, 'Kilobytes', stat.size);
				    		
				    		Plugin.filehandler.empty(file.name);
				    		
				    	}
				    	
						callback(Plugin.name, key, data);
				    	
				  	});
				    	
				}  	
			}	
		);
	});

};