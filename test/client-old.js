/**
 * Node Monitor
 */
 
// Includes
var tls = require('tls'),
	stack = require('../lib/long-stack-traces'),
		fs = require('fs'),
			step = require('../lib/step'),
				net = require('net');
 
// Utilities
var utilsModule = require('../modules/utils');
var utils = new utilsModule.UtilsModule();
var filehandler = require('../modules/filehandler.js');

// Constants
var constantsModule = require('../modules/constants');
var constants = new constantsModule.ConstantsModule();

// Logging
var logger = require('../modules/logger');	

// Failsafe
var failsafe = require('../modules/failsafe');

// Filehandler
var filehandlerModule = require('../modules/filehandler.js');
var filehandler = new filehandlerModule.FilehandlerModule();

var NodeMonitor = {
	config: require('../config/node_config'),
	ssl: false,
	plugins: {
	
	},
	logsToMonitor: [],
	serverConnection: false,
	utils: new utilsModule.UtilsModule(),
	lastSent: true,
	init: false,
	reconnecting: false
};

NodeMonitor.start = function() {
	var logPath = constants.values.LOGPATH + constants.values.NODELOG + '_log';	
	filehandler.empty(logPath);
	
	logger.setDest(constants.values.NODELOG);
	logger.enableConsole(constants.values.CONSOLEON);
	logger.write(constants.levels.INFO, 'Starting Node Monitor');
		
	if (this.config.alerts)	
		logger.write(constants.levels.INFO, 'Alerting enabled');
		
	this.onStart();
	this.serverConnect();
};

NodeMonitor.onStart = function() {	
	NodeMonitor.getPlugins();
	NodeMonitor.logMonitoring();
	NodeMonitor.check();
};

NodeMonitor.getPlugins = function() {
	var pluginCount = 0;
	var plugins = fs.readdirSync(this.config.pluginDirectory);
	plugins.forEach (
		function (plugin) {
			plugin = plugin.split('.')[0];
			var loaded = require(NodeMonitor.config.pluginDirectory + plugin);
			NodeMonitor.plugins[loaded.name] = loaded;
			logger.write(constants.levels.INFO, 'Loading plugin: ' + loaded.name.toString());

			pluginCount++;
		}
	);
	
	logger.write(constants.levels.INFO, pluginCount + ' plugins loaded, beginning long polling');
	
	NodeMonitor.executePlugins();
};

NodeMonitor.onConnect = function() {
	NodeMonitor.serverConnection.connected = true
	NodeMonitor.serverConnection.setEncoding('utf-8');
	
	logger.write(constants.levels.INFO, 'Connected to Monitoring Server at ' + NodeMonitor.config.server_address + ':' + NodeMonitor.config.server_port);
		
	if (NodeMonitor.reconnecting) {
		this.purgeCommitLog();
		NodeMonitor.reconnecting = false;
	}
	
	if (NodeMonitor.init == false) {
		this.onInit();
	} else {
		logger.write(constants.levels.INFO, 'Skipping actions on re-connect');
	}
};

NodeMonitor.onInit = function() {	
	NodeMonitor.init = true;
};

NodeMonitor.handleConnectionError = function(exception) {
	logger.write(constants.levels.SEVERE, 'A connection issue has arisen: ' + exception.message);
	if (!NodeMonitor.init)
		logger.write(constants.levels.WARNING, 'Error on initial connection, load plugins anyway and write to commit_log locally');

	NodeMonitor.serverReconnect();
};

NodeMonitor.handleTimeoutError = function() {
	logger.write(constants.levels.SEVERE, 'A connection to server timed out');
	if (!NodeMonitor.reconnecting)
		NodeMonitor.serverReconnect();
		
};

NodeMonitor.serverConnect = function() {
	if (this.ssl) {
		logger.write(constants.levels.INFO, 'SSL enabled');
		
		var certPem = fs.readFileSync('../ssl/test-cert.pem', encoding='ascii');
		var caPem = fs.readFileSync('../ssl/test-cert.pem', encoding='ascii');
		var options = {
			cert: certPem, 
			ca: caPem 
		};
		
		this.serverConnection = tls.connect(this.config.server_port, this.config.server_address, options, function() {			
			if (NodeMonitor.serverConnection.authorizationError) {
			   	logger.write(constants.levels.WARNING, 'Authorization Error: ' + NodeMonitor.serverConnection.authorizationError);
			} else {
			     logger.write(constants.levels.INFO, 'Authorized a Secure SSL/TLS Connection');
			     NodeMonitor.onConnect();
			}
		});
		
		this.serverConnection.on('data', 
			function() {
				logger.write(constants.levels.INFO, 'Received a message from the server: ' + data);
			}
		);
	} else {
		logger.write(constants.levels.INFO, 'No SSL support');
		
		this.serverConnection = net.createConnection(this.config.server_port, this.config.server_address);	
		
		this.serverConnection.on('connect', 
			function() {
			 	NodeMonitor.onConnect();
			}
		);	
	}
	
	this.serverConnection.on('error', 
		function(exception) {
			NodeMonitor.handleConnectionError(exception);
		}
	);
	
	this.serverConnection.on('timeout', 
		function() {
			NodeMonitor.handleTimeoutError();
		}
	);
};

NodeMonitor.serverReconnect = function() {	
	NodeMonitor.reconnecting = true;
	logger.write(constants.levels.INFO, 'Attempting reconnect to server in 20 seconds');
	setTimeout(
		function() {
			logger.write(constants.levels.WARNING, 'Tried to reconnect');
			NodeMonitor.serverConnect();
		}, 
		1000 * 20
	);
};

NodeMonitor.executePlugins = function() {
	if (this.plugin_interval)
		clearInterval(this.plugin_interval);
	
	this.plugin_interval = setInterval(
		function() {
			for (var plugin in NodeMonitor.plugins) {
				logger.write(constants.levels.INFO, 'Running plugin: ' + plugin);
				NodeMonitor.plugins[plugin].poll(
					function (plugin_name, key, data, alertCriteria) {
						
						logger.write(constants.levels.INFO, 'Plugin returned: ' + plugin_name + ' Alerts:' + alertCriteria.toString());
						
						/*
						 * Always insert/upsert plugins to keep track of them
						 */
						var lookupKey = utils.formatLookupPluginKey(NodeMonitor.config.node_name);
						NodeMonitor.sendDataLookup(lookupKey, plugin_name);
						
						if (NodeMonitor.config.alert) {
							NodeMonitor.handleAlerts(plugin_name, key, data, alertCriteria.toString());
						} else {
							/*
							 * Insert plugin data
							 */
							NodeMonitor.sendData(constants.api.PLUGINS, NodeMonitor.config.node_name + ':' + plugin_name, data);
							/*
							 * Insert plugin data by day
							 */
							var dataKey = utils.formatPluginKey(NodeMonitor.config.node_name, plugin_name);
							NodeMonitor.sendData(constants.api.PLUGINS, dataKey, data);
						}	
					}
				);
			}
		}, 
		this.config.timeToWait
	);
};

NodeMonitor.handleAlerts = function(plugin_name, key, data, alertCriteria) {
	
};

NodeMonitor.logMonitoring = function() {	
	/*
	if (this.config.monitorDirectories) {
		logger.write(constants.levels.INFO, 'Directories should be monitored');
		filehandler.readDirectory(NodeMonitor.config.directoryList, function () { 
			logger.write(constants.levels.INFO, 'Returned logs');
			logFileArray.forEach(
				function(object) {
					logger.write(constants.levels.INFO, 'RETURNED LOG FILE: ' + object.name);
					NodeMonitor.logsToMonitor.push(object.name);
				}
			);
			return;
		});
	}
	*/
	
	fs.readFile(this.config.logConfigFile, function (error, buffer, fd) {
		if (error) {
		
			logger.write(constants.levels.SEVERE, 'Error reading config file: ' + error.stack);
			
			return;
		}
	  	var splitBuffer = [];
	  	splitBuffer = buffer.toString().split('\n');
		for (i = 0; i < splitBuffer.length; i++) {
			logger.write(constants.levels.INFO, 'Found log in config: ' + splitBuffer[i]);
			
			var logName = splitBuffer[i];
			NodeMonitor.logsToMonitor.push(logName);
			
			var lookupKey = utils.formatLookupLogKey(NodeMonitor.config.node_name);			
			NodeMonitor.sendDataLookup(lookupKey, logName);
		}
		NodeMonitor.asyncTailing();
	});
};

NodeMonitor.asyncTailing = function() {	
	step(
		function tailAll() {
		    var self = this;
		    NodeMonitor.logsToMonitor.forEach(
		    	function(log) {
		    		logger.write(constants.levels.INFO, 'Now tailing log: ' + log);
		      		NodeMonitor.tailFile(log, self.parallel());
		    	}
		    );
		 },
		 function finalize(error) {
		    	if (error) { 
		    		logger.write(constants.levels.SEVERE, 'Error tailing log file: ' + error);
		    		return;
		    	}
		  }
	);
};

NodeMonitor.tailFile = function (logName, callback) {	
	var spawn = require('child_process').spawn;
	var tail = spawn('tail', ['-f', logName]);
    tail.stdout.on('data', function (data) {				
		var data = NodeMonitor.utils.format(constants.api.LOGS, data.toString());
		/*
		 * Always insert/upsert logs to keep track of them
		 */
		var lookupKey = utils.formatLookupLogKey(NodeMonitor.config.node_name);
		NodeMonitor.sendDataLookup(lookupKey, logName);
		/*
		 * Insert log data
		 */
		var dataKey = utils.formatLogKey(NodeMonitor.config.node_name, logName);
		NodeMonitor.sendData(constants.api.LOGS, NodeMonitor.config.node_name + ':' + logName, data);
		/*
		 * Insert log data by day 
		 */
		var dataKey = utils.formatLogKey(NodeMonitor.config.node_name, logName);
		NodeMonitor.sendData(constants.api.LOGS, dataKey, data);
	});
};

NodeMonitor.check = function() {
};

NodeMonitor.purgeCommitLog = function() {
	failsafe.purge(this);
};

NodeMonitor.deleteData = function(key) {
	jsonString = JSON.stringify({
		'name': 'DELETE', 
		'key': key,
		'origin': this.config.node_name
	});
	
	this.lastSent = this.writeData(jsonString);
};

NodeMonitor.sendDataLookup = function(key, data) {
	logger.write(constants.levels.INFO, 'Lookup key: ' + key);
	logger.write(constants.levels.INFO, 'Lookup data: ' + data);
	
	var jsonString = utils.formatLookupBroadcastData(key, data, this.config.node_name);
	
	logger.write(constants.levels.INFO, 'Data string being sent for lookup: ' + jsonString);
	
	this.lastSent = this.writeData(jsonString);
};

NodeMonitor.sendData = function(name, key, data) {
	logger.write(constants.levels.INFO, 'Data name: ' + name);
	logger.write(constants.levels.INFO, 'Data key: ' + key);
	logger.write(constants.levels.INFO, 'Data data: ' + data);
	
	var jsonString = utils.formatBroadcastData(name, key, data, this.config.node_name);
	
	logger.write(constants.levels.INFO, 'Data string being sent for date queries: ' + jsonString);
	this.lastSent = this.writeData(jsonString);
};

NodeMonitor.addToBulkData = function(jsonString) {
	var stringToAdd = utils.formatBulkPostData(jsonString);
};

NodeMonitor.writeData = function(jsonString) {
	
	if (this.serverConnection.readyState != 'open' && this.serverConnection.readyState != 'writeOnly') {
		logger.write(constants.levels.INFO, 'Error: socket not ready, skipping transmission and writing to commit_log');
		if (!NodeMonitor.reconnecting)
			NodeMonitor.serverReconnect();
			
		if (NodeMonitor.reconnecting)
			failsafe.commit(jsonString);
			
		return;
	} 
	
	this.serverConnection.write(this.config.startDelimiter + jsonString + this.config.endDelimiter, 'utf8');
};

NodeMonitor.start();