/**
 * command-manager.js module
 */
 
var fs = require('fs');

var modules = {

	loggingManager: 'logging-manager'

};

var Module = {};
var NodeMonitorObject;

CommandManagerModule = function (childDeps) {

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

	Module = this;
	
};

CommandManagerModule.prototype.executeCommand = function (command) {
	
	/**
	* Parse command
	*/
			
};	

CommandManagerModule.prototype.stopTailing = function(logName, client) {

};

CommandManagerModule.prototype.tailFile = function (logName, client) {
	
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
	
	//NodeMonitorObject.sendDataLookup(lookupKey, pidData);
	
    tail.stdout.on('data', function (data) {	
    	
    	if (count == 0) {
    		count++;
    	} else {
    		data = data.toString().replace(/(\r\n|\n|\r)/gm, '');	
			var data = Module.utilities.format(Module.constants.api.LOGS, data);
		
			var lookupKey = Module.utilities.formatLookupLogKey(process.env['clientIP']);
			//NodeMonitorObject.sendDataLookup(lookupKey, logName);
	
			var dataKey = Module.utilities.formatLogKey(process.env['clientIP'], logName);
			//NodeMonitorObject.sendData(Module.constants.api.LOGS, dataKey, data);
    	}
		
	});
	
};

exports.CommandManagerModule = CommandManagerModule;