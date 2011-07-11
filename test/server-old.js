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

// APIS
var websocketApiModule = require('../modules/websocketapi');
var websocketApi;
var clientApiModule = require('../modules/clientapi');
var clientApi = new clientApiModule.ClientApiModule();

// DAO
var daoModule = require('../modules/dao');
var dao = new daoModule.DAOModule();

var MonitorServer = {
	config: require('../config/server_config'),
	ssl: false,
	daemon_lock: '/tmp/nodemonitor_server.lock',
	server: false,
	db: 'CloudSandra',
	websocket: true,
	websocketServer1: websock.createServer({debug: true}),
	websocketServer2: websock.createServer({debug: true})
};

MonitorServer.start = function() {	
	logger.setDest(constants.values.SERVERLOG);
	logger.enableConsole(constants.values.CONSOLEON);
	logger.write(constants.levels.INFO, 'Starting Monitoring Server');
				
	this.daoConnection();
	this.startListener();
	this.openWebsocket1();
	this.openWebsocket2();
	this.storeSelf();
};

MonitorServer.daoConnection = function() {
	logger.write(constants.levels.INFO, 'Configured to store data using: ' + MonitorServer.db.toString());
	switch (this.db) {
		case constants.db.CLOUDSANDRA:
			/*
			 * Create column families if non-existant
			 */
			dao.createColumnFamily(constants.values.CFUTF8Type, 'UTF8Type');
			dao.createColumnFamily(constants.values.CFLongType, 'LongType');

			break;
	}		
};

MonitorServer.startListener = function() {
	
	var options = {};

	if (this.ssl) {
	
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
	
	logger.write(constants.levels.INFO, 'Now listening on: ' + this.config.node_listen_addr + ':' + this.config.node_listen_port);
	this.server.listen(this.config.node_listen_port, this.config.node_listen_addr);
};

MonitorServer.handleStream = function(stream) {
	stream.setEncoding('utf8');
	stream.on('connect', function(t) {
		logger.write(constants.levels.INFO, 'Node connected from: ' + stream.remoteAddress);
		logger.write(constants.levels.INFO, 'Now monitoring: ' + MonitorServer.server.connections + ' node(s)');
	});
	stream.on('data', function(data) {
		MonitorServer.handleData(data);
	});
	stream.on('end', function() {
		logger.write(constants.levels.INFO, 'Node disconnecting: ' + stream.remoteAddress);			
	});
};

MonitorServer.handleData = function(data) {
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
				if (MonitorServer.websocket)
					MonitorServer.sendWebsocketData1(message);
				
				
				 MonitorServer.parseData(message);
		
			}
			partsCount++; 		
		}
	);
};

/* 
 * Push all incoming data
 */
MonitorServer.openWebsocket1 = function() {
	this.websocketServer1.addListener('connection', function(conn){
	
		logger.write(constants.levels.INFO, 'Listening for websocket data connections on: ' + MonitorServer.config.websocket_data_port);
		logger.write(constants.levels.INFO, 'Opened connection on data websocket: ' + conn.id);
	 
 		conn.addListener('message', function(jsonObject) {
 			/*
 			 * Just a push websocket
 			 */
 		});
	});
	
	this.websocketServer1.listen(this.config.websocket_data_port);
		
	this.websocketServer1.addListener('close', function(conn) {
		logger.write(constants.levels.INFO, 'Closed websocket data connection: ' + conn.id);
	});
};

/*
 * Handle API requests
 */
MonitorServer.openWebsocket2 = function() {
	this.websocketServer2.addListener('connection', function(conn){
	
		logger.write(constants.levels.INFO, 'Listening for websocket api connections on: ' + MonitorServer.config.websocket_api_port);
		logger.write(constants.levels.INFO, 'Opened connection on api websocket: ' + conn.id);
		
		websocketApi = new websocketApiModule.WebsocketApiModule(MonitorServer.websocketServer2);
		
		/* 
		 * Store conn.id
		 */
		var postParams = {};
   		postParams[conn.id] = utils.generateFormattedDate();
   		
   		dao.postDataUTF8Type(constants.api.USERS, postParams);

		MonitorServer.websocketServer2.send(conn.id, utils.formatWebsocketApiData(constants.api.USERS, constants.api.POST, conn.id, constants.values.SELF));
	 
 		conn.addListener('message', function(jsonObject) {
 			logger.write(constants.levels.INFO, 'Handling websocket request');
 			MonitorServer.handleWebsocketRequests(jsonObject);
  		});
	});
	this.websocketServer2.listen(this.config.websocket_api_port);
		
	this.websocketServer2.addListener('close', function(conn) {
		logger.write(constants.levels.INFO, 'Closed websocket api connection: ' + conn.id);
		/* 
		 * Delete conn.id
		 */
		MonitorServer.deleteUTF8Type(constants.api.USERS, conn.id);
	});
};

MonitorServer.sendWebsocketData1 = function(data) {
	logger.write(constants.levels.INFO, 'Sending websocket data over websockets: ' + data);
	this.websocketServer1.broadcast(data);
};

MonitorServer.handleWebsocketRequests = function(jsonObject) {
	websocketApi.handleRequest(jsonObject);
};

MonitorServer.storeSelf = function() {
	/* 
	 * If column families were just created, allow some time
	 */
	(function(){
	    var t_count = 0;
	    (function(delay, count) {
	        setTimeout(function() {
	            if (count && ++t_count > count) 
	            	return;
	            
	            var postParams = {};
				postParams[MonitorServer.config.node_listen_addr] = utils.generateFormattedDate();
				
				dao.postDataUTF8Type(constants.values.SELF, postParams);
				            	
	            setTimeout(arguments.callee, delay);
	        }, delay);
	    })(5000, 1);
	})();
};

MonitorServer.parseData = function(data) {
	logger.write(constants.levels.INFO, 'Parsing data: ' + data);
	
	var assertObject = clientApi.handleRequest(data);
	
	if (assertObject.assert) {	 	
		logger.write(constants.levels.INFO, 'Assert returned true, storing this data');
		MonitorServer.storeData(assertObject);
	} else {
		logger.write(constants.levels.WARNING, 'Assert failed, not storing this data');
	}
};

MonitorServer.storeData = function(assertObject) {	
	/* 
	 * UTF8Type Column Family
	 */
	var postParams1 = {};
	postParams1[assertObject.origin] = utils.generateFormattedDate();
		
	/* 
	 * LongType Column Family for date sorting
	 */
	var postParams2 = {};
	var epoc = utils.generateEpocTime();
	
	postParams2[epoc] = assertObject.message;
	
	/* 
	 * UTF8Type Column Family
	 */
	var postParamsNormalized = {};
	postParamsNormalized[assertObject.message] = utils.generateFormattedDate();
		
	logger.write(constants.levels.INFO, 'Updating client keep alive: ' + assertObject.origin);
	
	/* 
	 * Post client
	 */
	logger.write(constants.levels.INFO, 'Storing key: ' + constants.api.CLIENTS);
	logger.write(constants.levels.INFO, 'Storing client as column: ' + assertObject.origin);
	
	dao.postDataUTF8Type(constants.api.CLIENTS, postParams1);
	
	/*
	 * Post data
	 */
	switch(assertObject.name) {
		case constants.api.LOOKUP:
			logger.write(constants.levels.INFO, 'Storing key: ' + assertObject.key);
			logger.write(constants.levels.INFO, 'Storing column: ' + assertObject.message);
			
			dao.postDataUTF8Type(assertObject.key, postParamsNormalized);
			
			break;
		default:
			logger.write(constants.levels.INFO, 'Storing key: ' + assertObject.key);
			logger.write(constants.levels.INFO, 'Storing column: ' + epoc);
			logger.write(constants.levels.INFO, 'Storing value: ' + assertObject.message);

			dao.postDataLongType(assertObject.key, postParams2);
			
			break;
	}		
};

MonitorServer.start();