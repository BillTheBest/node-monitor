/**
 * daemons.js - plugin
 */
 
var fs = require('fs');

var dependencies = {

	net: 'net'

}; 

var modules = {
	
	daoManager: '../modules/dao-manager.js',
	loggingManager: '../modules/logging-manager.js'
	
};
  
var Plugin = {

	name: 'daemons'
		
};

Plugin.format = function(data) {

	output_hash = {
		date: new Date().getTime(),
		returned: data,
	};
	return JSON.stringify(output_hash);
	
};

Plugin.evaluateDeps = function(childDeps, self) {

	for (var name in dependencies) {
		eval('var ' + name + '= require(\'' + dependencies[name] + '\')');
	}
	
	for (var name in modules) {
		eval('var ' + name + '= require(\'' + modules[name] + '\')');
	}
	
	for (var name in childDeps) {
		eval('var ' + name + '= require(\'' + childDeps[name] + '\')');
	}
	
	var utilities = new utilitiesManager.UtilitiesManagerModule();
	var constants = new constantsManager.ConstantsManagerModule();
	var logger = new loggingManager.LoggingManagerModule(childDeps);
	var dao = new daoManager.DaoManagerModule(childDeps);
	
	Plugin.config = config;
	Plugin.utilities = utilities;
	Plugin.constants = constants;
	Plugin.dao = dao;
	Plugin.logger = logger;
		
};

this.name = Plugin.name;

this.poll = function (childDeps, callback) {

	Plugin.evaluateDeps(childDeps, this);

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
					* Ignore empty file, or default of none
					*/
				} else {
					var stream = net.createConnection(daemon.port, Plugin.config.clientIP);
			
				  	var returnedSuccess = stream.on('connect', function() {	  		
				  		
				  		dao.postCloudwatch('RunningProcess-' + daemon.name, 'None', 1);
				  		
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
				  			dao.postCloudwatch('RunningProcess-' + daemon.name, 'None', 0);
				  			
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