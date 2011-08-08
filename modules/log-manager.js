/**
 * log-manager.js module
 */
 	
var fs = require('fs'); 

var dependencies = {
	
	step: 'step'
	
};
 
var modules = {

	loggingManager: 'logging-manager'

};

var Module = {};
var NodeMonitorObject;

LogManagerModule = function (nodeMonitor, childDeps) {

	try {
  		process.chdir(process.env['libDirectory']);
	} catch (Exception) {
  		
  	}
  	
  	for (var name in dependencies) {
		eval('var ' + name + ' = require(\'' + dependencies[name] + '\')');
	}

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

	NodeMonitorObject = nodeMonitor;
	Module = this;
	
	Module.utilities = utilities;
	Module.constants = constants;
	Module.logger = logger;
	Module.step = step;
	
	Module.childDeps = childDeps;
					
}; 

LogManagerModule.prototype.start = function() {

	fs.readFile(process.env['logConfigFile'], function (error, buffer, fd) {
		
		if (error) {
		
			Module.logger.write(Module.constants.levels.SEVERE, 'Error reading config file: ' + error.stack);
			
			return;
		}
		
	  	var splitBuffer = [];
	  	splitBuffer = buffer.toString().split('\n');
	  	
		for (i = 0; i < splitBuffer.length; i++) {
			Module.logger.write(Module.constants.levels.INFO, 'Found log in config: ' + splitBuffer[i]);
			
			var logName = splitBuffer[i];
			NodeMonitorObject.logsToMonitor.push(logName);

			if (logName == 'none' || '') {
				/**
				* Ignore empty file, probably a better way to do this...
				*/
			} else {
			
				var lookupKey = Module.utilities.formatLookupLogKey(process.env['clientIP']);			
				NodeMonitorObject.sendDataLookup(lookupKey, logName);
				
			}
		}
		Module.asyncTailing();
		
	});
		
};

LogManagerModule.prototype.asyncTailing = function() {	

	Module.step(
		function tailAll() {
		    var self = this;
		    NodeMonitorObject.logsToMonitor.forEach(
		    	function (log) {
		    		if (log == 'none' || '') {
		    			/**
						* Ignore empty file, probably a better way to do this...
						*/
		    		} else {
			    		Module.logger.write(Module.constants.levels.INFO, 'Now tailing log: ' + log);
			      		Module.tailFile(log, self.parallel());
			      	}
		    	}
		    );
		 },
		 function finalize(error) {
		    	if (error) { 
		    		Module.logger.write(Module.constants.levels.SEVERE, 'Error tailing log file: ' + error);
		    		return;
		    	}
		  }
	);
	
};

/**
* It is important to note that -F is correct, if the log file rolls,
* and we always ignore the first one. 
*/
LogManagerModule.prototype.tailFile = function (logName, callback) {
	
	var count = 0;
	var spawn = require('child_process').spawn;
	var tail = spawn('tail', ['-F', logName]);
	
	var logPid = tail.pid;
	
	var lookupKey = Module.utilities.formatLookupLogPidKey(process.env['clientIP']);
			
	var pidData = {
		log: logName,
		pid: logPid	
	}
	
	var pidData = JSON.stringify(pidData);
	
	NodeMonitorObject.sendDataLookup(lookupKey, pidData);
	
    tail.stdout.on('data', function (data) {	
    	
    	if (count == 0) {
    		count++;
    	} else {
    		data = data.toString().replace(/(\r\n|\n|\r)/gm, '');	
			var data = Module.utilities.format(Module.constants.api.LOGS, data);
		
			var lookupKey = Module.utilities.formatLookupLogKey(process.env['clientIP']);
			NodeMonitorObject.sendDataLookup(lookupKey, logName);
	
			var dataKey = Module.utilities.formatLogKey(process.env['clientIP'], logName);
			NodeMonitorObject.sendData(Module.constants.api.LOGS, dataKey, data);
    	}
		
	});
	
};

exports.LogManagerModule = LogManagerModule;