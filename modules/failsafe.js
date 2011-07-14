/**
 * Failsafe Module
 */

// Includes
var stack = require('../lib/long-stack-traces');
var fs = require('fs');
 
// Utilities
var utilsModule = require('./utils');
var utils = new utilsModule.UtilsModule();

// Global Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// Filehandler
var filehandlerModule = require('./filehandler.js');
var filehandler = new filehandlerModule.FilehandlerModule();

// Logging
var logger = require('./logger');

// DAO
var daoModule = require('../modules/dao');
var dao = new daoModule.DAOModule();

var fileName = '../logs/commit_log';

this.check = function() {
};

this.commit = function(data) {
	data += '\n';
	filehandler.write(fileName, data);
};

this.purge = function(NodeMonitor) {
	logger.write(constants.levels.INFO, 'Purging the commit_log: ' + fileName);	
	this.readFile(10, NodeMonitor);
};

this.readFile = function(bufferSize, NodeMonitor) {
  	this.m_count++;
  	
  	if (!bufferSize)
        bufferSize = 8192;

    var currentPositionInFile = 0;
    var buffer = "";
    var fd = fs.openSync(fileName, "r");

    var fillBuffer = function(position) {
        var res = fs.readSync(fd, bufferSize, position, "ascii");

        buffer += res[0];
        if (res[1] == 0)
            return -1;
       
        return position + res[1];
    };

    currentPositionInFile = fillBuffer(0);

    var hasNextLine = function() {
        while (buffer.indexOf('\n') == -1) {
            currentPositionInFile = fillBuffer(currentPositionInFile);
            if (currentPositionInFile == -1)
                return false;
           
        }
        if (buffer.indexOf('\n') > -1)
            return true;
        
        return false;
    };

    var nextLine = function() {
        var lineEnd = buffer.indexOf('\n');
        var result = buffer.substring(0, lineEnd);

        buffer = buffer.substring(result.length + 1, buffer.length);
        return result;
    };
    
    var purging = true;	
    
    var bulkLoadLookupRequest = {
    	rowkeys: []
    };

    var bulkLoadRequest = {
    	rowkeys: []
    };
     
    var returnedLookupRequestObject;
    var returnedBulkRequestObject;
    
    var returnedOnce = false;
    
  	do {
    	while (hasNextLine()) {
    	
    		var data = nextLine();
  			
			if (!returnedOnce) {
				var returnedObject = utils.formatBulkPostData(bulkLoadLookupRequest, bulkLoadRequest, data);
				returnedLookupRequestObject = returnedObject.bulkLoadLookupRequest;
				returnedBulkRequestObject = returnedObject.bulkLoadRequest;
				returnedOnce = true;
			} else {
				var returnedObject = utils.formatBulkPostData(returnedLookupRequestObject, returnedBulkRequestObject, data);
				returnedLookupRequestObject = returnedObject.bulkLoadLookupRequest;
				returnedBulkRequestObject = returnedObject.bulkLoadRequest;
			}
			
    	}
    	purging = false;
	} while (purging);
	
	/**
	* Now we need to aggregate counters for the entire bulk post
	*/
	// utils.aggregateCounters(returnedBulkRequestObject);
	
	var failsafeCheck;
	
	failsafeCheck = returnedLookupRequestObject.rowkeys;
	
	if (failsafeCheck == undefined)	 {
		logger.write(constants.levels.INFO, 'We have an issue with the bulk post, empyting for now');
		fs.writeFile(fileName, '', function(error){
			if (error)
				logger.write(constants.levels.SEVERE, 'Error cleaning up commit_log');
					
		});
	} else {
		logger.write(constants.levels.INFO, 'Lookup Bulk Load Request # Keys: ' + returnedLookupRequestObject.rowkeys.length);	
		logger.write(constants.levels.INFO, 'Lookup Bulk Load Request JSON: ' + JSON.stringify(returnedLookupRequestObject));
		
		dao.bulkPost(constants.values.CFUTF8Type, returnedLookupRequestObject);
		
		logger.write(constants.levels.INFO, 'Bulk Load Request # Keys: ' + returnedBulkRequestObject.rowkeys.length);	
		logger.write(constants.levels.INFO, 'Bulk Load Request JSON: ' + JSON.stringify(returnedBulkRequestObject));
		
		dao.bulkPost(constants.values.CFLongType, returnedBulkRequestObject);
	
		logger.write(constants.levels.INFO, 'Done purging commit_log');
		
		fs.writeFile(fileName, '', function(error){
			if (error)
				logger.write(constants.levels.SEVERE, 'Error cleaning up commit_log');
					
		});
	}
};
