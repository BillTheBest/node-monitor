/**
* Client Config
*/

	this.clientIP = '127.0.0.1';
	this.externalIP = '127.0.0.1';
	this.onEC2 = false;
	this.instanceId = '';
	this.drive = 'sda1';
	
	this.debug = true;
	
	/**
	* Never need to touch these
	*/
	this.init = false;
	this.reconnecting = false;
	this.realtime = false;
	this.logConfigFile = '../config/log_config';
	this.daemonConfigFile = '../config/daemon_config';
	this.processConfigFile = '../config/process_config';
	this.filesizeConfigFile = '../config/filesize_config';
	this.commitLogFile = '../logs/commit_log';
	this.pluginDirectory = '../plugins/';

	this.monitorDirectories = true;
	this.directoryList = '/var/log';
	
	
	this.timeToWait = 1000 * 30; // 30 seconds
	this.timeToPost = 1000 * 60 * 2; // 2 minutes
	this.keepAliveInterval = 1000 * 60 * 5; // 5 minutes
	this.serverReconnectTime = 1000 * 20 // 20 seconds

/**
* Server Config
*/
	// Temporarily disabled
	this.serverIP = '127.0.0.1';
	this.serverExternalIP = '127.0.0.1';
	//this.serverExternalIP = 'ec2-174-129-229-190.compute-1.amazonaws.com';
	//this.serverIP = '10.214.47.209';
	
	/**
	* Never need to touch these
	*/
	this.daemon_lock = '/tmp/nodemonitor_server.lock';
	this.db = 'CloudSandra';

/**
* General config
*/

	this.ssl = false;
	this.logFile = '../logs/log';
	this.commitLog = '../logs/commit_log';
	this.websocket = true;
	
	/**
	* Client => Server connection allows us to track up/down nodes, as
	* well as sending messages with ACL from UI => Server
	*/
	this.clientToServerPort = 9997;
	
	/**
	* Open up websocket connections either from Client => UI, or Server => UI 
	*/
	this.websocketApiPort = 8001;
	this.websocketRealtimePort = 8002;
	
	/**
	* When sending data form Client => Server, we have to delimit chunks
	*/
	this.startDelimiter = '//START//';
	this.endDelimiter = '//END//';
	
	/**
	* Turn logging to console off when deploying, otherwise use nohup
	*/
	this.logToConsole = true;
	
	/**
	* CloudWatch namespace
	*/
	this.cloudwatchEnabled = true;
	this.cloudwatchNamespace = 'Isidorey Instance Metrics';
