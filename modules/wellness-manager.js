/** 
 * wellness-manager.js module
 */
 
var fs = require('fs');

var modules = {
	
	daoManager: 'dao-manager'

};

var Module = {};

WellnessManagerModule = function (childDeps) {

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
	
	var constants = new constantsManager.ConstantsManagerModule();
	var dao = new daoManager.DaoManagerModule(childDeps);

	Module = this;
	
	Module.constants = constants;
	Module.dao = dao;
	
}; 
 
WellnessManagerModule.prototype.start = function() {

	if (Module.interval)
		clearInterval(Module.interval);
	
	Module.interval = setInterval(
		function() {
			Module.dao.storeSelf(Module.constants.api.CLIENTS, process.env['clientIP'], process.env['externalIP']);			
		}, 
		Number(process.env['keepAliveInterval']) * 1000
	);
	
};

exports.WellnessManagerModule = WellnessManagerModule;