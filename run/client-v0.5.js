/**
 * node-monitor 
 */
  
var fs = require('fs'); 
 
/**
* This should help with any odd exceptions/bugs we don't catch 
* (restart monitor, send alert with error)
*/

/*
process.on('uncaughtException', function (error) {
  	console.log('Caught exception: ' + error);
}); 
*/

/**
* Command line parameters keep things much easier to manage on a larger scale,
* and we auto-populate synchronously
*
* node client-v0.5.js ec2=false debug=true console=false cloudwatch=false
*/	
function init() {

	console.log('Current directory: ' + process.cwd());
	
	var exportGlobals = false;

	var arrayCount = 0;
	process.argv.forEach(
		function (value, index, array) {
			if (arrayCount == 0 || arrayCount == 1) {
				/**
				* We ignore node and client-v0.5.js
				*/
				console.log('Ignoring parameter: ' + value);
			} else {
				var valueArray = value.split('=');
				var key = valueArray[0];
				var param = valueArray[1];
				
				process.env[key] = param;
					
				if (arrayCount == (process.argv.length - 1))
					exportGlobals = true;
			
			}
			arrayCount++;
		}	
	);
		
	/**
	* Auto-populate box configuration settings on EC2
	*/	
	do {
		/**
		* Nothing
		*/
	} while (exportGlobals == false);

	if (process.env['ec2'] == 'true') {
	
		console.log('Trying auto-configuration');
		var autoPopulate = ['instance-id', 'local-ipv4', 'public-hostname'];
		
		autoPopulate.forEach(
			function (parameter) {
				var cmdline = '/monitoring/node-monitor/scripts/ec2-metadata  --' + parameter;
				require('child_process').exec(cmdline, function (error, stdout, stderr) {       
			        if (error) {
			        	console.log('Error auto-configuring');
			        	process.exit(1);
			        } else {
						process.env[parameter] = stdout;
						console.log('Setting ' + parameter + ': ' + process.env[parameter]);
			        }
				});
			}
		);
		
	} else {
		console.log('Not on EC2, skipping auto-configuration');
	}
	
	/**
	* Now we read the rest of the module config into global, and
	* make sure to start the monitor only after this completes
	*/
	fs.readFile('/monitoring/node-monitor/config/monitor_config', function (error, fd) {
		if (error) {
			console.log('Error reading node-monitor config file');
			process.exit(1);
		}
				
	  	var splitBuffer = [];
	  	splitBuffer = fd.toString().split('\n');
	  	
	  	for (i = 0; i < splitBuffer.length; i++) {
	  		var params = [];
	  		params = splitBuffer[i].split('=');

	  		process.env[params[0]] = params[1];
	  		
	  		console.log('Setting ' + params[0] + ': ' + process.env[params[0]]);
		}  	 
		
		monitor();
		
	});
	
}

/**
* We start monitoring after we've populated configs and parsed
* startup arguments
*/
function monitor() {

	/**
	* Handle dependencies (npm and custom) by declaring them here.
	* This is much easier to manage, dnd it's prettier on the eyes
	*/
	var dependencies = {
		
		tls: 'tls',
		websock: '../lib/websocket-server',
		net: 'net'
		
	}; 
	 
	var modules = {
	
		loggingManager: '../modules/logging-manager',
		filehandlerManager: '../modules/filehandler-manager',
		daoManager: '../modules/dao-manager',
		wellnessManager: '../modules/wellness-manager',
		bulkpostManager: '../modules/bulkpost-manager',
		pluginsManager: '../modules/plugins-manager',
		credentialManager: '../modules/credential-manager'
		
	};
	
	var childDeps = {
			
		stack: '../lib/long-stack-traces',
		utilitiesManager: '../modules-children/utilities-manager',  
		constantsManager: '../modules-children/constants-manager',
		cloudsandra: '../modules-children/node-cloudsandra',
		cloudwatch: '../modules-children/node-cloudwatch'
	
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
	
		init: false,
		serverConnection: false,
		plugins: {},
		logsToMonitor: [],
		websocketServer: websock.createServer({debug: false})
		
	};
	
	NodeMonitor.start = function() {
	
		credentials.check();
	
		logger.write(constants.levels.INFO, 'Starting Node Monitor');
		
		if (process.env['alerts'] == 'true')	
			logger.write(constants.levels.INFO, 'Alerts enabled');
	
		try {
			filehandler.empty('nohup.out');
		} catch (Exception) {
			logger.write(constants.levels.WARNING, 'Error emptying nohup.out file: ' + Exception);
		}
		
		try {
			filehandler.empty(process.env['logFile']);
		} catch (Exception) {
			logger.write(constants.levels.WARNING, 'Error emptying nohup.out file: ' + Exception);
		}			
		
		// dao.storeSelf(constants.api.CLIENTS, config.clientIP, config.externalIP);
		
		NodeMonitor.startPolling();
		
		try {
			NodeMonitor.serverConnect();
		} catch (Exception) {
			logger.write(constants.levels.WARNING, 'Error connection to Monitoring Server: ' + Exception);
		}
		
		if (process.env['websocket'] == 'true')
			NodeMonitor.openWebsocket();
			
	};
	
	NodeMonitor.startPolling = function() {	
	
		var keepalive = new wellnessManager.WellnessManagerModule(childDeps);
		var bulkpost = new bulkpostManager.BulkpostManagerModule(NodeMonitor, childDeps);
		var plugins = new pluginsManager.PluginsManagerModule(NodeMonitor, childDeps);
	
		keepalive.start();
		bulkpost.start();
		plugins.start();
				
		//var logMonitorModule = require('../modules/log-manager');
		//new logMonitorModule.LogMonitorModule(this);
		
	};
	
	NodeMonitor.setInit = function() {
		
		NodeMonitor.init = true;
		
		logger.write(constants.levels.INFO, 'We have initialized the connection to the Monitoring Server');
		
	};
	
	NodeMonitor.onConnect = function (serverAddress) {
	
		NodeMonitor.serverConnection.connected = true;
		NodeMonitor.serverConnection.setEncoding('utf-8');
		
		logger.write(constants.levels.INFO, 'Connected to Monitoring Server at ' + serverAddress + ':' + process.env['clientToServerPort']);
			
		if (NodeMonitor.reconnecting)
			NodeMonitor.reconnecting = false;
		
		if (NodeMonitor.init == false) {
			NodeMonitor.setInit();
		} else {
			logger.write(constants.levels.INFO, 'Skipping polling actions on re-connect, they are already established');
		}
		
	};
	
	NodeMonitor.serverReconnect = function() {	
	
		NodeMonitor.reconnecting = true;
		
		logger.write(constants.levels.INFO, 'Attempting reconnect to server in ' + process.env['serverReconnectTime'] + ' seconds');
		
		setTimeout(
			function() {
				logger.write(constants.levels.WARNING, 'Tried to reconnect');
				NodeMonitor.serverConnect();
			}, 
			Number(process.env['serverReconnectTime'])
		);
		
	};
	
	NodeMonitor.handleConnectionError = function (exception) {
	
		logger.write(constants.levels.SEVERE, 'A connection issue has arisen: ' + exception.message);
		
		if (!NodeMonitor.init)
			logger.write(constants.levels.WARNING, 'Error on initial connection to server, load plugins anyway and write server requests to commit_log locally');
	
		NodeMonitor.serverReconnect();
		
	};
	
	NodeMonitor.handleTimeoutError = function() {
	
		logger.write(constants.levels.SEVERE, 'A connection to the Monitoring Server timed out');
		
		if (!NodeMonitor.reconnecting)
			NodeMonitor.serverReconnect();
			
	};
	
	NodeMonitor.serverConnect = function() {
	
		var serverAddress;
		if (process.env['onEC2'] == 'true') {
			logger.write(constants.levels.INFO, 'Configuring Monitoring Server IP as internal');
			serverAddress = process.env['serverIP'];
		} else {
			logger.write(constants.levels.INFO, 'Configuring Monitoring Server IP as external');
			serverAddress = process.env['serverExternalIP'];
		}
	
		if (process.env['ssl'] == 'true') {
			logger.write(constants.levels.INFO, 'SSL enabled');
			
			var certPem = fs.readFileSync('../ssl/test-cert.pem', encoding='ascii');
			var caPem = fs.readFileSync('../ssl/test-cert.pem', encoding='ascii');
			var options = {
				cert: certPem, 
				ca: caPem 
			};
			
			NodeMonitor.serverConnection = tls.connect(Number(process.env['clientToServerPort']), serverAddress, options, function() {			
				if (NodeMonitor.serverConnection.authorizationError) {
				   	logger.write(constants.levels.WARNING, 'Authorization Error: ' + NodeMonitor.serverConnection.authorizationError);
				} else {
				     logger.write(constants.levels.INFO, 'Authorized a Secure SSL/TLS Connection');
				     NodeMonitor.onConnect(serverAddress);
				}
			});
			
			NodeMonitor.serverConnection.on('data', 
				function() {
					logger.write(constants.levels.INFO, 'Received a message from the server: ' + data);
					clientApi.handleDataRequest(data);
				}
			);
		} else {
			logger.write(constants.levels.INFO, 'No SSL support, trying connection on: ' + serverAddress);
			
			NodeMonitor.serverConnection = net.createConnection(Number(process.env['clientToServerPort']), serverAddress);	
			
			NodeMonitor.serverConnection.on('connect', 
				function() {
				 	NodeMonitor.onConnect(serverAddress);
				}
			);	
		}
		
		NodeMonitor.serverConnection.on('error', 
			function(exception) {
				NodeMonitor.handleConnectionError(exception);
			}
		);
		
		NodeMonitor.serverConnection.on('timeout', 
			function() {
				NodeMonitor.handleTimeoutError();
			}
		);
		
	};
	
	/**
	*
	* Handle simple key, column value data being stored.
	* CFUTF8Type ['rowKey'][IP] = '{data}'
	*/
	NodeMonitor.sendDataLookup = function (key, data) {
	
		var jsonString = utilities.formatLookupBroadcastData(key, utilities.generateEpocTime(), data, process.env['clientIP']);
		
		logger.write(constants.levels.INFO, 'Data string being sent for lookup: ' + jsonString);
		
		NodeMonitor.storeData(jsonString);
		
	};
	
	/**
	*
	* Handle time based data being stored.
	* CFLongType ['rowKey:YYYY:MM:DD'][EPOC] = '{data}'
	*/
	NodeMonitor.sendData = function (name, key, data) {	
	
		var jsonString = utilities.formatBroadcastData(name, key, utilities.generateEpocTime(), data, process.env['clientIP']);
		
		logger.write(constants.levels.INFO, 'Data string being sent for date queries: ' + jsonString);
		
		NodeMonitor.storeData(jsonString);
		
	};
	
	/**
	*
	* Handle how often data is stored, e.g. always bulk post for heavy nodes,
	* or post in realtime for better alerting on lighter, but important, nodes
	*/
	NodeMonitor.storeData = function (jsonString) {
	
		var assertObject = utilities.dataChecker(jsonString);
		
		if (assertObject.assert) { 	
		
			logger.write(constants.levels.INFO, 'Assert returned true, storing this data');
			
			if (process.env['realtime'] == 'true') {
				dao.handleDataStorage(assertObject);
			} else {
				failsafe.commit(jsonString);
				NodeMonitor.websocketServer.broadcast(jsonString);
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
	
	/** 
	 * Push all data to UI if requested, TLS by default
	 */
	NodeMonitor.openWebsocket = function() {
	
		NodeMonitor.websocketServer.addListener('connection', function(conn) {
		
			logger.write(constants.levels.INFO, 'Listening for websocket connections on: ' + process.env['websocketRealtimePort']);
			logger.write(constants.levels.INFO, 'Opened websocket connection to UI: ' + conn.id);
		 
	 		conn.addListener('message', function(jsonObject) {
	 			/**
	 			* Do nothing with this connection but push data
	 			*/
	 		});
		});
		
		NodeMonitor.websocketServer.on('error', function (exception) {
			logger.write(constants.levels.WARNING, 'Catching a websocket exception: ' + exception);
		});
		
		NodeMonitor.websocketServer.listen(Number(process.env['websocketRealtimePort']));
			
		NodeMonitor.websocketServer.addListener('close', function(conn) {
			logger.write(constants.levels.INFO, 'Closed websocket connection to UI: ' + conn.id);
		});
		
	};
	
	NodeMonitor.start();
	
}

init();