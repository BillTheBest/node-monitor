/**
 * node-monitor server
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
* node server-v0.5.js ec2=false debug=true console=true cloudwatch=false
*/	
function init() {

	console.log('Current directory: ' + process.cwd());
	
	var exportGlobals = false;

	var arrayCount = 0;
	process.argv.forEach(
		function (value, index, array) {
			if (arrayCount == 0 || arrayCount == 1) {
				/**
				* We ignore node and server-v0.5.js
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
		/**
		* We will need to run ifconfig, but it's not fun to parse on OSx
		*/
		console.log('Not on EC2, no websocket connections yet w/o');
		
		process.env['instance-id'] = 'none';
		process.env['local-ipv4'] = '127.0.0.1';
		process.env['public-hostname'] = '127.0.0.1';
	}
	
	/**
	* Now we read the rest of the module config into global, and
	* make sure to start the monitor only after this completes
	*/
	fs.readFile('../config/monitor_config', function (error, fd) {
		if (error) {
			console.log('Error reading node-monitor config file');
			process.exit(1);
		}
				
	  	var splitBuffer = [];
	  	splitBuffer = fd.toString().split('\n');
	  	
	  	for (i = 0; i < splitBuffer.length; i++) {
	  		var params = [];
	  		params = splitBuffer[i].split('=');

	  		if (params[0] == undefined || params[0] == '') {
				/**
				* Ignore
				*/
			} else {
	  			process.env[params[0]] = params[1];
	  			console.log('Setting ' + params[0] + ': ' + process.env[params[0]]);
	  		}
		}  	 
		
		server();
		
	});
	
}

/**
* We start server after we've populated configs and parsed
* startup arguments
*/
function server() {
	
	/**
	* Handle dependencies (npm and custom) by declaring them here.
	* This is much easier to manage, dnd it's prettier on the eyes
	*/
	var dependencies = {

		tls: 'tls',
		stack: '../lib/long-stack-traces',
		websock: '../lib/websocket-server',
		net: 'net',
		http: 'http',
		io: '../lib/socket.io',
		async: '../lib/async'
		
	}; 
	 
	var modules = {
	
		loggingManager: '../modules/logging-manager',
		filehandlerManager: '../modules/filehandler-manager',
		daoManager: '../modules/dao-manager',
		wellnessManager: '../modules/wellness-manager',
		bulkpostManager: '../modules/bulkpost-manager',
		pluginsManager: '../modules/plugins-manager',
		credentialManager: '../modules/credential-manager',
		websocketapiManager: '../modules/websocketapi-manager',
		clientapiManager: '../modules/clientapi-manager'
		
	};
	
	var childDeps = {
			
		stack: '../lib/long-stack-traces',
		utilitiesManager: '../modules-children/utilities-manager',  
		constantsManager: '../modules-children/constants-manager',
		cloudsandra: '../modules-children/node-cloudsandra',
		cloudwatch: '../modules-children/node-cloudwatch'
	
	};
	
	for (var name in dependencies) {
		eval('var ' + name + ' = require(\'' + dependencies[name] + '\')');
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
	var dao = new daoManager.DaoManagerModule(childDeps);
	var filehandler = new filehandlerManager.FilehandlerManagerModule(childDeps);
	var credentials = new credentialManager.CredentialManagerModule(childDeps);
	var clientapi = new clientapiManager.ClientapiManagerModule(childDeps);

	var MonitorServer = {
		server: false,
		clients: {},
		websocketServer: websock.createServer({debug: true})
	};
	
	MonitorServer.start = function() {	
	
		credentials.check();
	
		logger.write(constants.levels.INFO, 'Starting Monitoring Server');
	
		try {
			filehandler.empty('nohup.out');
		} catch (Exception) {
			logger.write(constants.levels.WARNING, 'Error emptying nohup.out file: ' + Exception);
		}
		
		try {
			filehandler.empty(process.env['logFile']);
		} catch (Exception) {
			logger.write(constants.levels.WARNING, 'Error emptying log file: ' + Exception);
		}
	
		dao.storeSelf(constants.api.SERVER, process.env['serverIP'], process.env['serverExternalIP']);
		
		MonitorServer.startListener();
		MonitorServer.openWebsocket();
		
	};
	
	MonitorServer.startListener = function() {
	
		logger.write(constants.levels.INFO, 'Starting listener');
		
		var options = {};
	
		if (process.env['ssl'] == 'true') {
		
			logger.write(constants.levels.INFO, 'SSL enabled');
			
			var keyPem = fs.readFileSync('../ssl/test-key.pem', encoding='ascii');
			var certPem = fs.readFileSync('../ssl/test-cert.pem', encoding='ascii');
			var caPem = fs.readFileSync('../ssl/test-cert.pem', encoding='ascii');
		
			options[key] = keyPem;
			options[cert] = certPem;
			options[ca] = caPem;
			
			this.server = tls.createServer(options, function(stream) {
				MonitorServer.handleStream(stream);
			});
		} else {
			logger.write(constants.levels.INFO, 'No SSL support');
			
			this.server = net.createServer(
				function(stream) {
					MonitorServer.handleStream(stream);
				}
			);
		}
		
		logger.write(constants.levels.INFO, 'Now listening on: ' + process.env['serverIP'] + ':' + process.env['clientToServerPort']);
		this.server.listen(Number(process.env['clientToServerPort']), process.env['serverIP']);
	};
	
	MonitorServer.getClients = function() {
	
		var clientCount = 0;
		for (var client in MonitorServer.clients) {
				clientCount++;
		}
		
		return clientCount;
		
	};
	
	/**
	* Keep track of total connections ever, as well as live connections
	*/
	MonitorServer.handleStream = function(stream) {
	
		/**
		* Let the client set timeout, and handle connections/clients here
		*/ 
	
		stream.setEncoding('utf8');
		stream.on('connect', function (t) {
		
			if (MonitorServer.clients[stream.remoteAddress]) {
				/**
				* Already being monitored
				*/
			
				logger.write(constants.levels.INFO, 'Node re-connected from: ' + stream.remoteAddress);
				
			} else {
				
				MonitorServer.clients[stream.remoteAddress] = new Date().getTime().toString();
				   			
	   			logger.write(constants.levels.INFO, 'Node connected from: ' + stream.remoteAddress);
				logger.write(constants.levels.INFO, 'Now monitoring: ' + MonitorServer.getClients() + ' node(s)');
	   			
			}	
				
		});
		
		stream.on('data', function(data) {
			MonitorServer.handleClientRequests(data);
		});
		
		stream.on('end', function() {
			
			logger.write(constants.levels.INFO, 'Node disconnected from: ' + stream.remoteAddress);		
			
		});
	};
	
	/**
	 * Handle client requests from clients
	 */
	MonitorServer.handleClientRequests = function(data) {
		logger.write(constants.levels.INFO, 'Data received from client: ' + data);
					
		var parts = [];
		data = utilities.trim(data);
		parts = data.split(/\/\/START\/\/(.*?)\/\/END\/\//);
		
		logger.write(constants.levels.INFO, 'Data size in parts: ' + parts.length.toString());
		
		var partsCount = 1;
		parts.forEach(
			function (message) {
				logger.write(constants.levels.INFO, 'Part # : ' + partsCount);
				if (utilities.isEven(partsCount)) {				
					 MonitorServer.parseData(message);
				}
				partsCount++; 		
			}
		);
	};
	
	
	MonitorServer.openWebsocket = function() {
		this.websocketServer.addListener('connection', function(conn){
		
			logger.write(constants.levels.INFO, 'Listening for websocket connections on: ' + process.env['websocketApiPort']);
			logger.write(constants.levels.INFO, 'Opened connection on websocket: ' + conn.id);
			
			var websocketapi = new websocketapiManager.WebsocketapiManagerModule(MonitorServer.websocketServer, childDeps);
			MonitorServer.websocketapi = websocketapi;
			
			/* 
			 * Store conn.id
			 */
			var postParams = {};
	   		postParams[conn.id] = new Date().getTime().toString();
	   		
	   		dao.postDataUTF8Type(constants.api.USERS, postParams);
	
			MonitorServer.websocketServer.send(conn.id, utilities.formatWebsocketApiData(constants.api.USERS, constants.api.POST, conn.id, constants.values.SELF));
		 
	 		conn.addListener('message', function(jsonObject) {
	 			logger.write(constants.levels.INFO, 'Handling websocket request');
	 			MonitorServer.handleWebsocketRequests(jsonObject);
	  		});
		});
		this.websocketServer.listen(Number(process.env['websocketApiPort']));
			
		this.websocketServer.addListener('close', function(conn) {
			logger.write(constants.levels.INFO, 'Closed websocket connection: ' + conn.id);
			/* 
			 * Delete conn.id
			 */
			dao.deleteUTF8Type(constants.api.USERS, conn.id);
		});
	};
	
	MonitorServer.sendWebsocketData = function(data) {
	
		logger.write(constants.levels.INFO, 'Sending data over websocket: ' + data);
		this.websocketServer.broadcast(data);
		
	};
	
	
	MonitorServer.handleWebsocketRequests = function(jsonObject) {
		MonitorServer.websocketapi.handleRequest(jsonObject);
	};

	MonitorServer.start();
	
}

/**
* Start the server
*/
init();