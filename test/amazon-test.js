// Includes
/*
var stack = require('../lib/long-stack-traces');
var ec2Module = require('../modules/ec2');
var ec2 = new ec2Module.EC2Module();
*/

//ec2.describeInstances();



//var stack = require('../lib/long-stack-traces'); 
//var ec2 = require('ec2-monitoring');

/*
var client = ec2.createClient({ 
	key: process.env['AWS_ACCESS_KEY_ID'], 
	secret: process.env['AWS_SECRET_ACCESS_KEY']
});
*/

/*
client.call('DescribeInstances', function (response) {
	console.log('request id ' + response.requestId);
	response.reservationSet.forEach(
		function (instance) {
			console.log('reservation id : ' + instance.reservationId);
			instance.groupSet.forEach(
				function (sg) {
					console.log('security group id: ' + sg.groupId);
					console.log('security group name: ' + sg.groupName);
				}
			);
			instance.instancesSet.forEach(
				function (info) {
					console.log('instance id: ' + info.instanceId);
					console.log('dns name: ' + info.dnsName);
					console.log('keypair: ' + info.keyName);
					console.log('internal ip: ' + info.privateIpAddress);
				}
			);
		}
	);
});	
*/

// Cloudwatch
var REST = require('../modules/node-cloudwatch');
var client = new REST.AmazonCloudwatchClient();

var params = {};

/*
client.request('DescribeAlarms', params, function (response) {
	console.log(response);
});	
*/

client.request('ListMetrics', params, function (response) {
	console.log(response);
});	

/*
client.call('DescribeSecurityGroups', { 'GroupName.1' : 'prod_db' }, function (response) {
	// console.log(response);
	console.log('request id ' + response.requestId);
	response.securityGroupInfo.forEach(
		function (group) {
			console.log('description: ' + group.groupDescription);
			group.ipPermissions.forEach(
				function (permission) {
					console.log('perm protocl: ' + permission.ipProtocol);
					console.log('perm from port: ' + permission.fromPort);
					console.log('perm to port: ' + permission.toPort);
				}
			);
		}
	);
});	
*/
/*
client.on('end', function () {
  	console.log('Closing');
});

client.execute();
*/
