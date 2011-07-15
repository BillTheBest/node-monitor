/**
 * dao-manager.js module
 */
 
var fs = require('fs');

var Module;

DaoManagerModule = function (childDeps) {
	
	for (var name in childDeps) {
		eval('var ' + name + '= require(\'' + childDeps[name] + '\')');
	}
	
	var utilities = new utilitiesManager.UtilitiesManagerModule();
	var constants = new constantsManager.ConstantsManagerModule();
	
	var CloudsandraApi = new cloudsandra.CloudsandraApi();
	var CloudwatchApi = new cloudwatch.AmazonCloudwatchClient();
	
	Module = this;
	
	Module.utilities = utilities;
	Module.constants = constants;
	Module.cloudsandraApi = CloudsandraApi;
	Module.cloudwatchApi = CloudwatchApi;
	
};

DaoManagerModule.prototype.debugMode = function() {

	if (process.env['debug'] == 'true')
		return true;

	return false;	
		
};

DaoManagerModule.prototype.cloudwatchAlerts = function() {

	if (process.env['cloudwatchEnabled'] == 'true')
		return true;

	return false;	
		
};

DaoManagerModule.prototype.storeSelf = function (type, internalIP, externalIP) {

	if (this.debugMode())
		return;

	var date = new Date();

	var postParams1 = {};
	postParams1[internalIP] = date.getTime();
	
	Module.cloudsandraApi.postData(Module.constants.values.CFUTF8Type, type, postParams1, null, function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});
	
	var postParams2 = {};
	postParams2[internalIP] = externalIP;
	
	Module.cloudsandraApi.postData(Module.constants.values.CFUTF8Type, Module.constants.api.CLIENT_EXTERNAL, postParams2, null, function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});
	
};

DaoManagerModule.prototype.postCloudwatch = function (metricName, unit, value) {

	if (this.debugMode())
		return;
		
	if (this.cloudwatchAlerts())
		return;
	
	params = {};
	
	params['Namespace'] = process.env['cloudwatchNamespace'];
	params['MetricData.member.1.MetricName'] = metricName;
	params['MetricData.member.1.Unit'] = unit;
	params['MetricData.member.1.Value'] = value;
	params['MetricData.member.1.Dimensions.member.1.Name'] = 'InstanceID';
	params['MetricData.member.1.Dimensions.member.1.Value'] = process.env['instanceId'];
	
	if (process.env['cloudwatchEnabled'] == 'true') {
		Module.cloudwatchApi.request('PutMetricData', params, function (response) {
			
		});
	}	
	
	return params;
	
};

DaoManagerModule.prototype.handleDataStorage = function (assertObject) {

	if (this.debugMode())
		return;
		
	var postParams1 = {};
	postParams1[assertObject.origin] = Module.utilities.generateFormattedDate();
		 
	var postParams2 = {}
	postParams2[assertObject.date] = escape(assertObject.message);
		
	this.postDataUTF8Type(Module.constants.api.CLIENTS, postParams1);
	
	switch (assertObject.name) {
		case Module.constants.api.LOOKUP:

			var postParams = {};
			postParams[assertObject.message] = Module.utilities.generateFormattedDate();

			this.postDataUTF8Type(assertObject.key, postParams);
			
			break;
			
		default:
		
			this.postDataLongType(assertObject.key, postParams2);
			this.incrementCount(Module.utilities.safeEncodeKey(assertObject.key), assertObject.name, 1);
			
			break;
	}		
};

DaoManagerModule.prototype.createColumnFamily = function (cfName, cfType) {

	if (this.debugMode())
		return;
	
	Module.cloudsandraApi.createColumnFamily(cfName, cfType, function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});
	
};

DaoManagerModule.prototype.postDataUTF8Type = function (key, postParams) {	

	if (this.debugMode())
		return;

	Module.cloudsandraApi.postData(Module.constants.values.CFUTF8Type, Module.utilities.safeEncodeKey(key), postParams, null, function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});
	
};

DaoManagerModule.prototype.postDataLongType = function (key, postParams) {	

	if (this.debugMode())
		return;

	Module.cloudsandraApi.postData(Module.constants.values.CFLongType, Module.utilities.safeEncodeKey(key), postParams, null, function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});
	
};

DaoManagerModule.prototype.deleteUTF8Type = function (key, column) {

	if (this.debugMode())
		return;

	Module.cloudsandraApi.deleteDataFromRow(Module.constants.values.CFUTF8Type, Module.utilities.safeEncodeKey(key), column, function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});
	
};

DaoManagerModule.prototype.getRow = function (cfName, key, callback) {

	if (this.debugMode())
		return;

	Module.cloudsandraApi.getRow(cfName, Module.utilities.safeEncodeKey(key), function (response) {
		callback(response);
	});
	
};

DaoManagerModule.prototype.paginateRow = function (cfName, key, fromKey, limit, callback) {

	if (this.debugMode())
		return;

	Module.cloudsandraApi.paginateRow(cfName, Module.utilities.safeEncodeKey(key), fromKey, limit, function (response) {
		callback(response);
	});
	
};

DaoManagerModule.prototype.incrementCount = function (key, cName, value) {

	if (this.debugMode())
		return;

	Module.cloudsandraApi.incrementCount(key, cName, value, function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});
	
};

DaoManagerModule.prototype.decrementCount = function (key, cName, value) {

	if (this.debugMode())
		return;

	Module.cloudsandraApi.decrementCount(key, cName, value, function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});
	
};

DaoManagerModule.prototype.mapReduceTable = function (key, postParams) {

	if (this.debugMode())
		return;

	Module.cloudsandraApi.mapReduceTable(key, postParams, function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});
	
};

DaoManagerModule.prototype.mapReduceJob = function (postParams) {

	if (this.debugMode())
		return;

	Module.cloudsandraApi.mapReduceTable(jsonObject.data, postParams, function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});
	
};

DaoManagerModule.prototype.bulkPost = function (cfName, bulkLoadRequest) {

	if (this.debugMode())
		return;

	Module.cloudsandraApi.postBulkData(cfName, JSON.stringify(bulkLoadRequest), function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});	
	
};

DaoManagerModule.prototype.deleteDataFromRow = function (cfName, rowKey, cName) {

	if (this.debugMode())
		return;

	Module.cloudsandraApi.deleteDataFromRow(cfName, rowKey, cName, function (response) {
		Module.cloudsandraApi.parseForDisplay(response);
	});
	
};

exports.DaoManagerModule = DaoManagerModule;