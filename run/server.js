/**
 * Node Monitor Server
 */

// Includes
var tls = require('tls'),
	stack = require('../lib/long-stack-traces'),
		websock = require('../lib/websocket-server'),
			net = require('net'),
				http = require('http'),
					io = require('../lib/socket.io'),
						fs = require('fs'),
							async = require('../lib/async');
 
// Utilities
var utilsModule = require('../modules/utils');
var utils = new utilsModule.UtilsModule();

// Constants
var constantsModule = require('../modules/constants');
var constants = new constantsModule.ConstantsModule();

// Logging
var logger = require('../modules/logger');

// Filehandler
var filehandlerModule = require('../modules/filehandler');
var filehandler = new filehandlerModule.FilehandlerModule();

// APIS
var websocketApiModule = require('../modules/websocketapi');
var websocketApi;

var clientApiModule = require('../modules/clientapi');
var clientApi = new clientApiModule.ClientApiModule();

// DAO
var daoModule = require('../modules/dao');
var dao = new daoModule.DAOModule();

var MonitorServer = {
	config: require('../config/config'),
	server: false,
	connectionCount: 0,
	websocketServer: websock.createServer({debug: true})
};

MonitorServer.start = function() {	
	filehandler.empty(this.config.logFile);

	logger.enableConsole(this.config.logToConsole);
	logger.write(constants.levels.INFO, 'Starting Monitoring Server');
	logger.write(constants.levels.INFO, 'Configured to store data using: ' + this.config.db);
				
	this.startListener();
	this.openWebsocket();
	
	dao.storeSelf(constants.api.SERVER, this.config.serverIP, this.config.serverExternalIP);
};

MonitorServer.startListener = function() {

	logger.write(constants.levels.INFO, 'Starting listener');
	
	var options = {};

	if (this.config.ssl) {
	
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
		
		this.server = net.createServer(function(stream) {
			MonitorServer.handleStream(stream);
		});
	}
	
	logger.write(constants.levels.INFO, 'Now listening on: ' + this.config.serverIP + ':' + this.config.clientToServerPort);
	this.server.listen(this.config.clientToServerPort, this.config.serverIP);
};

/**
* Keep track of total connections ever, as well as live connections
*/
MonitorServer.handleStream = function(stream) {
	stream.setEncoding('utf8');
	stream.on('connect', function(t) {
			
		MonitorServer.connectionCount++;
			
		dao.incrementCount(constants.api.CONNECTIONS, constants.api.CONNECTIONS_TOTAL, '1');
   		dao.incrementCount(constants.api.CONNECTIONS, constants.api.CONNECTIONS_LIVE, MonitorServer.connectionCount);
	
		logger.write(constants.levels.INFO, 'Node connected from: ' + stream.remoteAddress);
		logger.write(constants.levels.INFO, 'Now monitoring: ' + MonitorServer.connectionCount + ' node(s)');
	});
	stream.on('data', function(data) {
		MonitorServer.handleClientRequests(data);
	});
	stream.on('end', function() {
	
		MonitorServer.connectionCount--;
		
		dao.decrementCount(constants.api.CONNECTIONS, constants.api.CONNECTIONS_LIVE, MonitorServer.connectionCount);
		
		logger.write(constants.levels.INFO, 'Node disconnected from: ' + stream.remoteAddress);		
		logger.write(constants.levels.INFO, 'Now monitoring: ' + MonitorServer.connectionCount + ' node(s)');	
	});
};

/**
 * Handle client requests from clients
 */
MonitorServer.handleClientRequests = function(data) {
	logger.write(constants.levels.INFO, 'Data received from client: ' + data);
				
	var parts = [];
	data = utils.trim(data);
	parts = data.split(/\/\/START\/\/(.*?)\/\/END\/\//);
	
	logger.write(constants.levels.INFO, 'Data size in parts: ' + parts.length.toString());
	
	var partsCount = 1;
	parts.forEach(
		function (message) {
			logger.write(constants.levels.INFO, 'Part # : ' + partsCount);
			if (utils.isEven(partsCount)) {				
				 MonitorServer.parseData(message);
			}
			partsCount++; 		
		}
	);
};


MonitorServer.openWebsocket = function() {
	this.websocketServer.addListener('connection', function(conn){
	
		logger.write(constants.levels.INFO, 'Listening for websocket connections on: ' + MonitorServer.config.websocketApiPort);
		logger.write(constants.levels.INFO, 'Opened connection on websocket: ' + conn.id);
		
		websocketApi = new websocketApiModule.WebsocketApiModule(MonitorServer.websocketServer);
		
		/* 
		 * Store conn.id
		 */
		var postParams = {};
   		postParams[conn.id] = new Date().getTime().toString();
   		
   		dao.postDataUTF8Type(constants.api.USERS, postParams);

		MonitorServer.websocketServer.send(conn.id, utils.formatWebsocketApiData(constants.api.USERS, constants.api.POST, conn.id, constants.values.SELF));
	 
 		conn.addListener('message', function(jsonObject) {
 			logger.write(constants.levels.INFO, 'Handling websocket request');
 			MonitorServer.handleWebsocketRequests(jsonObject);
  		});
	});
	this.websocketServer.listen(this.config.websocketApiPort);
		
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
	websocketApi.handleRequest(jsonObject);
};

MonitorServer.start();