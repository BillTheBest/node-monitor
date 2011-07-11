/**
* DAO Module
*/

// Includes
var stack = require('../lib/long-stack-traces');
 
// Utilities
var utilsModule = require('./utils');
var utils = new utilsModule.UtilsModule();

// Global Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// CloudSandra
var api = require('../modules/node-cloudsandra');
var CloudsandraApi = new api.CloudsandraApi();

DAOModule = function() {

};

DAOModule.prototype.storeSelf = function(type, internalIP, externalIP) {
	var date = new Date();

	var postParams1 = {};
	postParams1[internalIP] = date.getTime();
	
	CloudsandraApi.postData(constants.values.CFUTF8Type, type, postParams1, null, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
	
	var postParams2 = {};
	postParams2[internalIP] = externalIP;
	
	CloudsandraApi.postData(constants.values.CFUTF8Type, constants.api.CLIENT_EXTERNAL, postParams2, null, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
};

DAOModule.prototype.createColumnFamily = function(cfName, cfType) {
	CloudsandraApi.createColumnFamily(cfName, cfType, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
};

DAOModule.prototype.postDataUTF8Type = function(key, postParams) {	
	CloudsandraApi.postData(constants.values.CFUTF8Type, utils.safeEncodeKey(key), postParams, null, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
};

DAOModule.prototype.postDataLongType = function(key, postParams) {	
	CloudsandraApi.postData(constants.values.CFLongType, utils.safeEncodeKey(key), postParams, null, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
};

DAOModule.prototype.deleteUTF8Type = function(key, column) {
	CloudsandraApi.deleteDataFromRow(constants.values.CFUTF8Type, utils.safeEncodeKey(key), column, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
};

DAOModule.prototype.getRow = function(cfName, key, callback) {
	CloudsandraApi.getRow(cfName, utils.safeEncodeKey(key), function(response) {
		callback(response);
	});
};

DAOModule.prototype.paginateRow = function(cfName, key, fromKey, limit, callback) {
	CloudsandraApi.paginateRow(cfName, utils.safeEncodeKey(key), fromKey, limit, function(response) {
		callback(response);
	});
};

DAOModule.prototype.incrementCount = function(key, cName, value) {
	CloudsandraApi.incrementCount(key, cName, value, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
};

DAOModule.prototype.decrementCount = function(key, cName, value) {
	CloudsandraApi.decrementCount(key, cName, value, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
};

DAOModule.prototype.mapReduceTable = function(key, postParams) {
	CloudsandraApi.mapReduceTable(key, postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
};

DAOModule.prototype.mapReduceJob = function(postParams) {
	CloudsandraApi.mapReduceTable(jsonObject.data, postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
};

DAOModule.prototype.bulkPost = function(cfName, bulkLoadRequest) {
	CloudsandraApi.postBulkData(cfName, JSON.stringify(bulkLoadRequest), function(response) {
		CloudsandraApi.parseForDisplay(response);
	});	
};

DAOModule.prototype.deleteDataFromRow = function(cfName, rowKey, cName) {
	CloudsandraApi.deleteDataFromRow(cfName, rowKey, cName, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
};

DAOModule.prototype.handleDataStorage = function(assertObject) {
	// UTF8Type Column Family
	var postParamsNormalized = {};
	postParamsNormalized[assertObject.message] = utils.generateFormattedDate();
		
	// UTF8Type Column Family
	var postParams1 = {};
	postParams1[assertObject.origin] = utils.generateFormattedDate();
		 
	// LongType Column Family for date sorting
	var postParams2 = {}
	postParams2[assertObject.date] = escape(assertObject.message);
		
	this.postDataUTF8Type(constants.api.CLIENTS, postParams1);
	
	switch(assertObject.name) {
		case constants.api.LOOKUP:

			this.postDataUTF8Type(assertObject.key, postParamsNormalized);
			
			break;
		default:
		
			this.postDataLongType(assertObject.key, postParams2);
			this.incrementCount(utils.safeEncodeKey(assertObject.key), assertObject.name, 1);
			
			break;
	}		
};

exports.DAOModule = DAOModule;