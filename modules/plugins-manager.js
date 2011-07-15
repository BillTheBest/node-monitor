/**
 * plugins-manager.js module
 */
 
var fs = require('fs'); 
 
var modules = {
	
	loggingManager: '../modules/logging-manager.js'
	
};

var Module;
var NodeMonitorObject;

PluginsManagerModule = function (nodeMonitor, childDeps) {

	for (var name in modules) {
		eval('var ' + name + '= require(\'' + modules[name] + '\')');
	}
	
	for (var name in childDeps) {
		eval('var ' + name + '= require(\'' + childDeps[name] + '\')');
	}
	
	var utilities = new utilitiesManager.UtilitiesManagerModule();
	var constants = new constantsManager.ConstantsManagerModule();
	var logger = new loggingManager.LoggingManagerModule(childDeps);

	NodeMonitorObject = nodeMonitor;
	Module = this;
	
	Module.utilities = utilities;
	Module.constants = constants;
	Module.logger = logger;
	
	Module.childDeps = childDeps;
		
}; 

PluginsManagerModule.prototype.start = function() {

	var pluginCount = 0;
	var plugins = fs.readdirSync(process.cwd() + process.env['pluginDirectory']);
	plugins.forEach (
		function (plugin) {
			plugin = plugin.split('.')[0];
			var loaded = require(process.cwd() + process.env['pluginDirectory'] + plugin);
			NodeMonitorObject.plugins[loaded.name] = loaded;
			
			Module.logger.write(Module.constants.levels.INFO, 'Loading plugin: ' + loaded.name.toString());

			pluginCount++;
		}
	);
	
	Module.logger.write(Module.constants.levels.INFO, pluginCount + ' plugins loaded, beginning long polling');
	
	Module.executePlugins();
	
};

PluginsManagerModule.prototype.executePlugins = function() {

	if (Module.interval) {
		clearInterval(Module.interval);
		Module.interval = {
		
		};
	}
	
	Module.interval = setInterval(
		function() {
			for (var plugin in NodeMonitorObject.plugins) {
			
				Module.logger.write(Module.constants.levels.INFO, 'Running plugin: ' + plugin);
				
				NodeMonitorObject.plugins[plugin].poll(Module.childDeps, function (pluginName, key, data) {
						
						Module.logger.write(Module.constants.levels.INFO, 'Plugin returning: ' + pluginName);
						
						if (key) {
					
							var lookupKey = Module.utilities.formatLookupPluginKey(process.env['clientIP']);
							NodeMonitorObject.sendDataLookup(lookupKey, pluginName);
							
							var dataKey = Module.utilities.formatPluginKey(process.env['clientIP'], pluginName);
							NodeMonitorObject.sendData(Module.constants.api.PLUGINS, dataKey, data);
							
							
						} else {
							Module.logger.write(Module.constants.levels.INFO, 'The plugin returned a bad response');
						}	
					}
				);
			}
		}, 
		Number(process.env['timeToWait'])
	);
};

exports.PluginsManagerModule = PluginsManagerModule;