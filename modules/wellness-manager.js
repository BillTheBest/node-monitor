/** 
 * wellness-manager.js module
 */
 
var fs = require('fs');

var modules = {
	
	daoManager: '../modules/dao-manager.js'

};

var Module;

WellnessManagerModule = function (childDeps) {

	for (var name in modules) {
		eval('var ' + name + '= require(\'' + modules[name] + '\')');
	}
	
	for (var name in childDeps) {
		eval('var ' + name + '= require(\'' + childDeps[name] + '\')');
	}
	
	var constants = new constantsManager.ConstantsManagerModule();
	var dao = new daoManager.DaoManagerModule(childDeps);

	Module = this;
	
	Module.constants = constants;
	Module.dao = dao;
	Module.config = config;
	
}; 
 
WellnessManagerModule.prototype.start = function() {

	if (Module.config.wellnessInterval)
		clearInterval(Module.config.wellnessInterval);
	
	Module.config.wellnessInterval = setInterval(
		function() {
			dao.storeSelf(Module.constants.api.CLIENTS, Module.config.clientIP, Module.config.externalIP);			
		}, 
		Module.config.keepAliveInterval
	);
	
};

exports.WellnessManagerModule = WellnessManagerModule;