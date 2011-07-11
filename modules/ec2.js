/**
* EC2 Module
*/

// Includes
var stack = require('../lib/long-stack-traces'); 
var ec2 = require('ec2');

// Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// Logging
var logger = require('./logger');

// Need to execute commands to set credentials
var client = ec2.createClient({ 
	key: process.env['AWS_ACCESS_KEY_ID'], 
	secret: process.env['AWS_SECRET_ACCESS_KEY']
});

var returnedInstanceObjects = [];
 
EC2Module = function() {

};

EC2Module.prototype.describeInstances = function (callback) {  
	var returnedInstanceObjects = [];
	client.call('DescribeInstances', function (response) {
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
	client.on('end', function () {
  		logger.write(constants.levels.INFO, 'Closing connection');
  		callback(returnedInstanceObjects);
	});
  	client.execute();
};

EC2Module.prototype.getSecurityGroups = function() {  
	logger.write(constants.levels.INFO, 'request id ' + response.requestId);
	response.securityGroupInfo.forEach(
		function (group) {
			console.log('description: ' + group.groupDescription);
			group.ipPermissions.forEach(
				function (permission) {
					logger.write(constants.levels.INFO, 'perm protocol: ' + permission.ipProtocol);
					logger.write(constants.levels.INFO, 'perm from port: ' + permission.fromPort);
					logger.write(constants.levels.INFO, 'perm to port: ' + permission.toPort);
				}
			);
		}
	);	
	client.on('end', function () {
  		logger.write(constants.levels.INFO, 'Closing connection');
	});
	client.execute();
};

exports.EC2Module = EC2Module;