/**
 * bulkpost-manager.js module
 */
 
var fs = require('fs'); 
 
var modules = {

	filehandlerManager: '../modules/filehandler-manager.js'

};

var Module;
var NodeMonitorObject;

BulkpostManagerModule = function (nodeMonitor, childDeps) {

	for (var name in modules) {
		eval('var ' + name + '= require(\'' + modules[name] + '\')');
	}
	
	for (var name in childDeps) {
		eval('var ' + name + '= require(\'' + childDeps[name] + '\')');
	}
	
	var filehandler = new filehandlerManager.FilehandlerManagerModule(childDeps);

	NodeMonitorObject = nodeMonitor;
	Module = this;
	
	Module.filehandler = filehandler;
	Module.config = config;
				
}; 

BulkpostManagerModule.prototype.start = function() {

	if (Module.config.bulkInterval)
		clearInterval(config.bulkInterval);
	
	Module.config.bulkInterval = setInterval(
		function() {
			Module.filehandler.purgeCommitLog(NodeMonitorObject);
		}, 
		Module.config.timeToPost
	);
	
};

exports.BulkpostManagerModule = BulkpostManagerModule;