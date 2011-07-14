/**
 * node-monitor 
 */
 
var fs = require('fs'); 
 
var dependencies = {
	
	tls: 'tls',
	websock: '../lib/websocket-server',
	net: 'net'
	
}; 
 
var modules = {

	loggingManager: '../modules/logging-manager.js',
	filehandlerManager: '../modules/filehandler-manager.js',
	daoManager: '../modules/dao-manager.js',
	wellnessManager: '../modules/wellness-manager.js',
	bulkpostManager: '../modules/bulkpost-manager.js',
	pluginsManager: '../modules/plugins-manager.js',
	// logmonitoringManager: '../modules/logmonitoring-manager.js',
	credentialManager: '../modules/credential-manager.js'
	
};

var childDeps = {
		
	stack: '../lib/long-stack-traces',
	utilitiesManager: '../modules-children/utilities-manager.js',  
	constantsManager: '../modules-children/constants-manager.js',
	cloudsandra: '../modules-children/node-cloudsandra',
	cloudwatch: '../modules-children/node-cloudwatch',	
	config: '../config/config'

};

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
var logger = new loggingManager.LoggingManagerModule(childDeps);
var dao = new daoManager.DaoManagerModule(childDeps);
var filehandler = new filehandlerManager.FilehandlerManagerModule(childDeps);
var credentials = new credentialManager.CredentialManagerModule(childDeps);

var NodeMonitor = {

	serverConnection: false,
	plugins: {},
	logsToMonitor: [],
	websocketServer: websock.createServer({debug: false})
	
};

NodeMonitor.start = function() {

	credentials.check();

	logger.write(constants.levels.INFO, 'Starting Node Monitor');
	
	if (config.alerts)	
		logger.write(constants.levels.INFO, 'Alerts enabled');

	try {
		filehandler.empty('nohup.out');
	} catch (Exception) {
		logger.write(constants.levels.WARNING, 'Error emptying nohup.out file: ' + Exception);
	}
	
	try {
		filehandler.empty(config.logFile);
	} catch (Exception) {
		logger.write(constants.levels.WARNING, 'Error emptying nohup.out file: ' + Exception);
	}			
	
	this.onStart();
	
	try {
		this.serverConnect();
	} catch (Exception) {
		logger.write(constants.levels.WARNING, 'Error connection to Monitoring Server: ' + Exception);
	}
	
	if (config.websocket)
		this.openWebsocket();
		
};

NodeMonitor.onStart = function() {	

	dao.storeSelf(constants.api.CLIENTS, config.clientIP, config.externalIP);

	// Keep-alive Manager
	var keepAliveModule = require('../modules/keepalive-manager');
	new keepAliveModule.KeepAliveModule(this);
	
	//var bulkpostManager = require('../modules/bulkpost-manager');
	//var bulkpost = new bulkpostManager.BulkpostManagerModule(NodeMonitor, childDeps);
	
	// Bulk Post Manager
	var bulkLoadModule = require('../modules/bulk-load-manager');
	new bulkLoadModule.BulkLoadModule(this);
	
	// Plugins Manager
	var pluginModule = require('../modules/plugin-manager');
	new pluginModule.PluginModule(this);
	
	// Log Monitoring
	var logMonitorModule = require('../modules/log-manager');
	new logMonitorModule.LogMonitorModule(this);
};

NodeMonitor.onInit = function() {	
	NodeMonitor.init = true;
};

NodeMonitor.onConnect = function(serverAddress) {
	NodeMonitor.serverConnection.connected = true
	NodeMonitor.serverConnection.setEncoding('utf-8');
	
	logger.write(constants.levels.INFO, 'Connected to Monitoring Server at ' + serverAddress + ':' + NodeMonitor.config.clientToServerPort);
		
	if (NodeMonitor.reconnecting) {
		NodeMonitor.reconnecting = false;
	}
	
	if (NodeMonitor.init == false) {
		this.onInit();
	} else {
		logger.write(constants.levels.INFO, 'Skipping initial actions on re-connect');
	}
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

NodeMonitor.handleConnectionError = function(exception) {
	logger.write(constants.levels.SEVERE, 'A connection issue has arisen: ' + exception.message);
	if (!NodeMonitor.init)
		logger.write(constants.levels.WARNING, 'Error on initial connection to server, load plugins anyway and write server requests to commit_log locally');

	NodeMonitor.serverReconnect();
};

NodeMonitor.handleTimeoutError = function() {
	logger.write(constants.levels.SEVERE, 'A connection to server timed out');
	if (!NodeMonitor.reconnecting)
		NodeMonitor.serverReconnect();
		
};

NodeMonitor.serverConnect = function() {

	var serverAddress;
	if (config.onEC2) {
		logger.write(constants.levels.INFO, 'Configuring Monitoring Server IP as internal');
		serverAddress = config.serverIP;
	} else {
		logger.write(constants.levels.INFO, 'Configuring Monitoring Server IP as external');
		serverAddress = config.serverExternalIP;
	}

	if (config.ssl) {
		logger.write(constants.levels.INFO, 'SSL enabled');
		
		var certPem = fs.readFileSync('../ssl/test-cert.pem', encoding='ascii');
		var caPem = fs.readFileSync('../ssl/test-cert.pem', encoding='ascii');
		var options = {
			cert: certPem, 
			ca: caPem 
		};
		
		this.serverConnection = tls.connect(config.clientToServerPort, serverAddress, options, function() {			
			if (NodeMonitor.serverConnection.authorizationError) {
			   	logger.write(constants.levels.WARNING, 'Authorization Error: ' + NodeMonitor.serverConnection.authorizationError);
			} else {
			     logger.write(constants.levels.INFO, 'Authorized a Secure SSL/TLS Connection');
			     NodeMonitor.onConnect(serverAddress);
			}
		});
		
		this.serverConnection.on('data', 
			function() {
				logger.write(constants.levels.INFO, 'Received a message from the server: ' + data);
				clientApi.handleDataRequest(data);
			}
		);
	} else {
		logger.write(constants.levels.INFO, 'No SSL support, trying connection on: ' + serverAddress);
		
		this.serverConnection = net.createConnection(config.clientToServerPort, serverAddress);	
		
		this.serverConnection.on('connect', 
			function() {
			 	NodeMonitor.onConnect(serverAddress);
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

NodeMonitor.handleAlerts = function(plugin_name, key, date, data, alertCriteria) {
	
};

/**
*
* Handle simple key, column value data being stored.
* CFUTF8Type ['rowKey'][IP] = '{data}'
*/
NodeMonitor.sendDataLookup = function(key, data) {
	var jsonString = utilities.formatLookupBroadcastData(key, utilities.generateEpocTime(), data, config.clientIP);
	
	logger.write(constants.levels.INFO, 'Data string being sent for lookup: ' + jsonString);
	
	this.storeData(jsonString);
};

/**
*
* Handle time based data being stored.
* CFLongType ['rowKey:YYYY:MM:DD'][EPOC] = '{data}'
*/
NodeMonitor.sendData = function(name, key, data) {	
	var jsonString = utilities.formatBroadcastData(name, key, utilities.generateEpocTime(), data, config.clientIP);
	
	logger.write(constants.levels.INFO, 'Data string being sent for date queries: ' + jsonString);
	
	this.storeData(jsonString);
};

/**
*
* Handle how often data is stored, e.g. always bulk post for heavy nodes,
* or post in realtime for better alerting on lighter, but important, nodes
*/
NodeMonitor.storeData = function(jsonString) {
	// Check for bad data
	var assertObject = utilities.dataChecker(jsonString);
	
	if (assertObject.assert) { 	
	
		logger.write(constants.levels.INFO, 'Assert returned true, storing this data');
		
		if (config.realtime) {
			// Store in CloudSandra
			dao.handleDataStorage(assertObject);
		} else {
			// Store in file
			failsafe.commit(jsonString);
			this.websocketServer.broadcast(jsonString);
		}
	} else {
		logger.write(constants.levels.WARNING, 'Assert failed, not storing this data');
	}	
};

/**
* Handle requests/changes from server
*/
NodeMonitor.messageHandler = function() {
	/*
	if (this.serverConnection.readyState != 'open' && this.serverConnection.readyState != 'writeOnly') {
		logger.write(constants.levels.INFO, 'Error: socket not ready, skipping transmission and writing to commit_log');
		if (!NodeMonitor.reconnecting)
			NodeMonitor.serverReconnect();
			
		if (NodeMonitor.reconnecting)
			failsafe.commit(jsonString);
			
		return;
	} 

	this.serverConnection.write(config.startDelimiter + jsonString + config.endDelimiter, 'utf8');
	*/
};

/* 
 * Push all data to UI if requested, TLS by default
 */
NodeMonitor.openWebsocket = function() {
	this.websocketServer.addListener('connection', function(conn) {
	
		logger.write(constants.levels.INFO, 'Listening for websocket connections on: ' + NodeMonitor.config.websocketRealtimePort);
		logger.write(constants.levels.INFO, 'Opened websocket connection to UI: ' + conn.id);
	 
 		conn.addListener('message', function(jsonObject) {
 			/**
 			* Do nothing with this connection but push data
 			*/
 		});
	});
	
	this.websocketServer.on('error', function (exception) {
		logger.write(constants.levels.WARNING, 'Catching a websocket exception: ' + exception);
	});
	
	this.websocketServer.listen(config.websocketRealtimePort);
		
	this.websocketServer.addListener('close', function(conn) {
		logger.write(constants.levels.INFO, 'Closed websocket connection to UI: ' + conn.id);
	});
};


NodeMonitor.start();