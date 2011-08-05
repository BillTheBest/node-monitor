/**
 * daemons.js - plugin
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

	name: 'daemons'
		
};

Plugin.format = function (data) {

	data = data.replace(/(\r\n|\n|\r)/gm, '');
	return data;
	
};

Plugin.evaluateDeps = function (childDeps, self) {

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
				    	
						var data = Plugin.format(daemon.name, '1');
						
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