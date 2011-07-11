/* 
 * Plugin Manager Module
 */
 
// Includes
var stack = require('../lib/long-stack-traces'),
	fs = require('fs');

// Utilities
var utilsModule = require('./utils');
var utils = new utilsModule.UtilsModule();

// Logging
var logger = require('./logger');

// Global Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// Module Constants
var Module;
var NodeMonitorObject;

PluginModule = function (clientMonitor) {
	NodeMonitorObject = clientMonitor;
	
	Module = this;
	Module.getPlugins();
};

PluginModule.prototype.getPlugins = function() {
	var pluginCount = 0;
	var plugins = fs.readdirSync(NodeMonitorObject.config.pluginDirectory);
	plugins.forEach (
		function (plugin) {
			plugin = plugin.split('.')[0];
			var loaded = require(NodeMonitorObject.config.pluginDirectory + plugin);
			NodeMonitorObject.plugins[loaded.name] = loaded;
			
			logger.write(constants.levels.INFO, 'Loading plugin: ' + loaded.name.toString());

			pluginCount++;
		}
	);
	
	logger.write(constants.levels.INFO, pluginCount + ' plugins loaded, beginning long polling');
	
	Module.executePlugins();
};

/**
* Always insert/upsert plugins to keep track of them, as 
* well as by day.  Also
*/
PluginModule.prototype.executePlugins = function() {
	if (NodeMonitorObject.config.plugin_interval)
		clearInterval(NodeMonitorObject.config.plugin_interval);
	
	NodeMonitorObject.config.plugin_interval = setInterval(
		function() {
			for (var plugin in NodeMonitorObject.plugins) {
			
				logger.write(constants.levels.INFO, 'Running plugin: ' + plugin);
				
				NodeMonitorObject.plugins[plugin].poll(
					function (pluginName, key, data) {
						
						logger.write(constants.levels.INFO, 'Plugin returning: ' + pluginName);
						
						if (key) {
					
							var lookupKey = utils.formatLookupPluginKey(NodeMonitorObject.config.clientIP);
							NodeMonitorObject.sendDataLookup(lookupKey, pluginName);
							
							var dataKey = utils.formatPluginKey(NodeMonitorObject.config.clientIP, pluginName);
							NodeMonitorObject.sendData(constants.api.PLUGINS, dataKey, data);
							
							
						} else {
							logger.write(constants.levels.INFO, 'The plugin returned a bad response');
						}	
					}
				);
			}
		}, 
		NodeMonitorObject.config.timeToWait
	);
};

exports.PluginModule = PluginModule;