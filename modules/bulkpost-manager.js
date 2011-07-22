/**
 * bulkpost-manager.js module
 */
 	
var fs = require('fs'); 
 
var modules = {

	filehandlerManager: 'filehandler-manager'

};

var Module = {};
var NodeMonitorObject;

BulkpostManagerModule = function (nodeMonitor, childDeps) {

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
	
	var filehandler = new filehandlerManager.FilehandlerManagerModule(childDeps);

	NodeMonitorObject = nodeMonitor;
	Module = this;

	Module.filehandler = filehandler;
	
	Module.childDeps = childDeps;
					
}; 

BulkpostManagerModule.prototype.start = function() {

	if (Module.interval)
		clearInterval(Module.interval);
	
	Module.interval = setInterval(
		function() {
			Module.filehandler.purgeCommitLog(NodeMonitorObject);
		}, 
		Number(process.env['timeToPost']) * 1000
	);
	
};

exports.BulkpostManagerModule = BulkpostManagerModule;