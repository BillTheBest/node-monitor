/**
* unit-tests.js
*/

var childDeps = {
		
	stack: '../lib/long-stack-traces',
	utilitiesManager: '../modules-children/utilities-manager.js',  
	constantsManager: '../modules-children/constants-manager.js',
	cloudsandra: '../modules-children/node-cloudsandra',
	cloudwatch: '../modules-children/node-cloudwatch',	
	config: '../config/config'

};

/**
* bulkpost-manager.js test
*/
function testBulkpostManager() {

	var NodeMonitor = {};

	var bulkpostManager = require('../modules/bulkpost-manager');
	var bulkpost = new bulkpostManager.BulkpostManagerModule(NodeMonitor, childDeps);
	
}

/**
* credential-manager.js test
*/
function testCredentialManager() {

	var credentialManager = require('../modules/credential-manager');
	var credentials = new credentialManager.CredentialManagerModule(childDeps);
	
	credentials.check();
	
}

/**
* command-manager.js test
*/
function testCommandManager() {

	var command = 'ls'
	
	var commandManager = require('../modules/command-manager');
	var commands = new commandManager.CommandManagerModule(childDeps);
	
	commands.executeCommand(command);
	
}

/**
* dao-manager.js test
*/
function testDaoManager() {

	var daoManager = require('../modules/dao-manager');
	var dao = new daoManager.DaoManagerModule(childDeps);

}

/**
* ec2-manager.js test
*/
function testEC2Manager() {

	var ec2Manager = require('../modules/ec2-manager');
	var ec2 = new ec2Manager.EC2ManagerModule(childDeps);

}

/**
* filehandler-manager.js test
*/
function testFilehandlerManager() {

	var filehandlerManager = require('../modules/filehandler-manager');
	var filehandler = new filehandlerManager.FilehandlerManagerModule(childDeps);

}

/**
* logging-manager.js test
*/
function testLoggingManager() {

	var loggingManager = require('../modules/logging-manager');
	var logger = new loggingManager.LoggingManagerModule(childDeps);
	
}

/**
* plugins-manager.js test
*/
function testPluginsManager() {

	var NodeMonitor = {};

	var pluginsManager = require('../modules/plugins-manager');
	var plugins = new pluginsManager.PluginsManagerModule(NodeMonitor, childDeps);

}

/**
* websocketapi-manager.js test
*/
function testWebsocketapiManager() {

	var websocketServer =  {};

	var websocketapiManager = require('../modules/websocketapi-manager');
	var websocketApi = new websocketapiManager.WebsocketapiManagerModule(websocketServer, childDeps);

}

/**
* wellness-manager.js test
*/
function testWellnessManager() {

	var wellnessManager = require('../modules/wellness-manager');
	var keepalive = new wellnessManager.WellnessManagerModule(childDeps);

}

function test() {

	// testBulkpostManager();
	
	testCredentialManager();

	// testCommandManager();
	
	// testDaoManager();
	
	// testEC2Manager();
	
	// testFilehandlerManager();
	
	// testLoggingManager();
	
	// testPluginsManager();
	
	// testWebsocketapiManager();
	
	// testWellnessManager();

}

test();
