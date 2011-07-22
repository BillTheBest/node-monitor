/**
 * plugins-manager.js module
 */
 
var fs = require('fs'); 
 
var modules = {
	
	loggingManager: 'logging-manager'
	
};

var Module = {};
var NodeMonitorObject;

PluginsManagerModule = function (nodeMonitor, childDeps) {

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
	
	Module.childDeps = childDeps;
		
}; 

PluginsManagerModule.prototype.start = function() {
	
	try {
	  	process.chdir(process.env['pluginDirectory']);
	} catch (Exception) {
	  	Module.logger.write(Module.constants.levels.INFO, 'Error moving to directory: ' + Exception);
	}

	var pluginCount = 0;
	var plugins = fs.readdirSync(process.cwd());
	plugins.forEach (
		function (plugin) {
			plugin = plugin.split('.')[0];
			var loaded = require(process.cwd() + '/' + plugin);
			NodeMonitorObject.plugins[loaded.name] = loaded;
			
			Module.logger.write(Module.constants.levels.INFO, 'Loading plugin: ' + loaded.name.toString());

			pluginCount++;
		}
	);
	
	Module.logger.write(Module.constants.levels.INFO, pluginCount + ' plugins loaded, beginning long polling');
	
	Module.executePlugins();
	
};

PluginsManagerModule.prototype.executePlugins = function() {

	if (Module.interval)
		clearInterval(Module.interval);
	
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
		Number(process.env['timeToWait']) * 1000
	);
};

exports.PluginsManagerModule = PluginsManagerModule;