/**
 * ec2-manager.js module
 */
 
var fs = require('fs'); 
 
var dependencies = {
	
	ec2: 'ec2'

};

var modules = {
	
	loggingManager: 'logging-manager'

};

var Module = {};

EC2ManagerModule = function (childDeps) {

	try {
  		process.chdir(process.env['moduleDirectory']);
	} catch (Exception) {
  		
  	}

	for (var name in dependencies) {
		eval('var ' + name + ' = require(\'' + dependencies[name] + '\')');
	}
	
	for (var name in modules) {
		eval('var ' + name + ' = require(\'' + modules[name] + '\')');
	}
	
	for (var name in childDeps) {
		eval('var ' + name + ' = require(\'' + childDeps[name] + '\')');
	}
	
	var constants = new constantsManager.ConstantsManagerModule();
	var logger = new loggingManager.LoggingManagerModule(childDeps);
	
	var client = ec2.createClient({ 
		key: process.env['AWS_ACCESS_KEY_ID'], 
		secret: process.env['AWS_SECRET_ACCESS_KEY']
	});

	Module = this;
	
	Module.constants = constants;
	Module.logger = logger;
	Module.client = client;
		
}; 

EC2ManagerModule.prototype.describeInstances = function (callback) {  
	
	var returnedInstanceObjects = [];
	Module.client.call('DescribeInstances', function (response) {
		response.reservationSet.forEach(
			function (instance) {
				var instanceIds = {};
				var securityGroups = {};
				
				instance.groupSet.forEach(
					function (sg) {				
						securityGroups[sg.groupId] = sg.groupName;
					}
				);
				
				instance.instancesSet.forEach(
					function (info) {						
						instanceIds[info.instanceId] = info.privateIpAddress;
					}
				);
				
				var returnedInstanceObject = {};
				returnedInstanceObject['instanceIds'] = instanceIds;
				returnedInstanceObject['securityGroups'] = securityGroups;
				returnedInstanceObjects.push(returnedInstanceObject);
			}
		);
	});	
	
	Module.client.on('end', function () {
  		Module.logger.write(Module.constants.levels.INFO, 'Closing connection');
  		callback(returnedInstanceObjects);
	});
	
  	Module.client.execute();
  	
};

EC2ManagerModule.prototype.getSecurityGroups = function() {  

	Module.logger.write(Module.constants.levels.INFO, 'request id ' + response.requestId);
	response.securityGroupInfo.forEach(
		function (group) {
			console.log('description: ' + group.groupDescription);
			group.ipPermissions.forEach(
				function (permission) {
					Module.logger.write(Module.constants.levels.INFO, 'perm protocol: ' + permission.ipProtocol);
					Module.logger.write(Module.constants.levels.INFO, 'perm from port: ' + permission.fromPort);
					Module.logger.write(Module.constants.levels.INFO, 'perm to port: ' + permission.toPort);
				}
			);
		}
	);	
	
	Module.client.on('end', function () {
  		Module.logger.write(Module.constants.levels.INFO, 'Closing connection');
	});
	
	Module.client.execute();
	
};

exports.EC2ManagerModule = EC2ManagerModule;