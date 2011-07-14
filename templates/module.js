/**
 * my-manager.js module (Template for creating your own modules)
 */
 
var fs = require('fs');

var dependencies = {
	
	stack: '../lib/long-stack-traces'

};

var modules = {

};

var Module;
var NodeMonitorObject;

MyManagerModule = function (nodeMonitor, childDeps) {

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
	
	NodeMonitorObject = nodeMonitor;
	Module = this;
	
};

MyManagerModule.prototype.foo = function () {
	
};

exports.MyManagerModule = MyManagerModule;