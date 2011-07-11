/**
 * Logger Module
 */

// Includes
var stack = require('../lib/long-stack-traces');
var fs = require('fs');

// Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// CloudSandra
var api = require('../modules/node-cloudsandra');
var CloudsandraApi = new api.CloudsandraApi();

// Config
var config = require('../config/config');

// Cloudwatch
var REST = require('../modules/node-cloudwatch');
var client = new REST.AmazonCloudwatchClient();

// DAO
var daoModule = require('../modules/dao');
var dao = new daoModule.DAOModule();

var enabled;

this.enableConsole = function(set) {
	enabled = set;
};

this.cloudwatchCriteria = function(message) {
	
	params = {};
	
	params['Namespace'] = config.cloudwatchNamespace;
	params['MetricData.member.1.MetricName'] = 'NodeMonitorAlerts';
	params['MetricData.member.1.Unit'] = 'None';
	params['MetricData.member.1.Value'] = message;
	params['MetricData.member.1.Dimensions.member.1.Name'] = 'InstanceID';
	params['MetricData.member.1.Dimensions.member.1.Value'] = config.instanceId;
	
	if (config.cloudwatchEnabled) {
		client.request('PutMetricData', params, function (response) {
			
		});
	}
	
};

this.write = function(level, message) {
	
	var date = new Date();
	message = date + ' ' + level + ' ' + message + '\n';
	
	var fileName = '../logs/log';

	if (enabled)
		console.log(message);
	
	if (level == constants.levels.SEVERE) {
	
		this.cloudwatchCriteria(message);
		
		var postParams = {};
		
		var data = {
			origin: NodeMonitorObject.config.clientIP, 
			alert: message
		};
		
		postParams[date.getTime()] = escape(data);
		var date = new Date();
		dao.postDataLongType(constants.api.ALERTS + ':' + date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate(), postParams);
		
	}
	
	fs.open(fileName, 'a', 0666, function(error, fd) {
		if (error) 
			return;
			
		if (error)
			return;
			
		fs.write(fd, message, null, 'utf8', function(error, written) {
			if (error)
				return;
		});
		fs.close(fd, function (error) {
			if (error)
				return;
		});
	});
	
};