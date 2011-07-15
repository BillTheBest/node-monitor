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
	
}; 
 
WellnessManagerModule.prototype.start = function() {

	if (Module.interval)
		clearInterval(Module.interval);
	
	Module.interval = setInterval(
		function() {
			dao.storeSelf(Module.constants.api.CLIENTS, process.env['clientIP'], process.env['externalIP']);			
		}, 
		Number(process.env['keepAliveInterval'])
	);
	
};

exports.WellnessManagerModule = WellnessManagerModule;