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
	
	this.filehandler = filehandler;
				
}; 

BulkpostManagerModule.prototype.start = function() {

	if (Module.interval)
		clearInterval(Module.interval);
	
	Module.interval = setInterval(
		function() {
			BulkpostManagerModule.filehandler.purgeCommitLog(NodeMonitorObject);
		}, 
		Number(process.env['timeToPost'])
	);
	
};

exports.BulkpostManagerModule = BulkpostManagerModule;