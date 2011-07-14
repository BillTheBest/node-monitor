/** 
 * filehandler-manager.js module
 */
 
var fs = require('fs');

var modules = {
	
	loggingManager: '../modules/logging-manager.js'

};

var Module;

FilehandlerManagerModule = function (childDeps) {

	for (var name in modules) {
		eval('var ' + name + '= require(\'' + modules[name] + '\')');
	}
	
	for (var name in childDeps) {
		eval('var ' + name + '= require(\'' + childDeps[name] + '\')');
	}
	
	var utilities = new utilitiesManager.UtilitiesManagerModule();
	var constants = new constantsManager.ConstantsManagerModule();
	var logger = new loggingManager.LoggingManagerModule(childDeps);

	Module = this;
	
	Module.utilities = utilities;
	Module.constants = constants;
	Module.logger = logger;
	
}; 

FilehandlerManagerModule.prototype.write = function (fileName, data) {

	fs.open(fileName, 'a', 0666, function (error, fd) {
	
		if (error)
			Module.logger.write(Module.constants.levels.INFO, 'Error opening file: ' + fileName);
			
		try {	
			fs.write(fd, data, null, 'utf8', function (error, written) {
				Module.logger.write(Module.constants.levels.INFO, 'Writing file');
				if (error)
					Module.logger.write(Module.constants.levels.INFO, 'Error writing to file: ' + fileName);
			});
		} catch (Exception) {
			Module.logger.write(Module.constants.levels.WARNING, 'There was an error trying to write to a file: ' + Exception);
		}
		
		fs.close(fd, function (error) {
			if (error)
				Module.logger.write(Module.constants.levels.INFO, 'Error closing file: ' + error);
		});
		
	});
	
};

FilehandlerManagerModule.prototype.empty = function (fileName) {

	fs.writeFile(fileName, '', function (error) {
		if (error)
			Module.logger.write(Module.constants.levels.INFO, 'Error emptying file: ' + error);
				
	});
	
};

FilehandlerManagerModule.prototype.readLogDirectory = function (path, callback) {

	var logArray = [];
    var files = fs.readdirSync(path);
    
    for (var i in files) {
    	var currentFile = path + '/' + files[i];
      	var stats = fs.statSync(currentFile);
       	if (stats.isFile()) {
			logArray.push(currentFile);
       		Module.logger.write(Module.constants.levels.INFO, 'Found a file: ' + currentFile);
       	} else if (stats.isDirectory()) {
         	traverseFileSystem(currentFile);
        }
  	}
   
	callback(logArray);
	
};

FilehandlerManagerModule.prototype.addToCommitLog = function (fileName, data) {

	data += '\n';
	this.write(fileName, data);
	
};

FilehandlerManagerModule.prototype.purgeCommmitLog = function() {
	
	Module.logger.write(Module.constants.levels.INFO, 'Posting the commit log');	
	
	var bufferSize = 10;
 	
  	if (!bufferSize)
        bufferSize = 8192;

    var currentPositionInFile = 0;
    var buffer = '';
    var fd = fs.openSync(commitLogFile, 'r');

    var fillBuffer = function(position) {
        var res = fs.readSync(fd, bufferSize, position, 'ascii');

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
				var returnedObject = Module.utilities.formatBulkPostData(bulkLoadLookupRequest, bulkLoadRequest, data);
				returnedLookupRequestObject = returnedObject.bulkLoadLookupRequest;
				returnedBulkRequestObject = returnedObject.bulkLoadRequest;
				returnedOnce = true;
			} else {
				var returnedObject = Module.utilities.formatBulkPostData(returnedLookupRequestObject, returnedBulkRequestObject, data);
				returnedLookupRequestObject = returnedObject.bulkLoadLookupRequest;
				returnedBulkRequestObject = returnedObject.bulkLoadRequest;
			}
			
    	}
    	
    	purging = false;
    	
	} while (purging);
	
	/**
	* Now we need to aggregate counters for the entire bulk post
	*/
	// Module.utilities.aggregateCounters(returnedBulkRequestObject);
	
	Module.logger.write(Module.constants.levels.INFO, 'Lookup Bulk Load Request # Keys: ' + returnedLookupRequestObject.rowkeys.length);	
	Module.logger.write(Module.constants.levels.INFO, 'Lookup Bulk Load Request JSON: ' + Module.utilities.toJSON(returnedLookupRequestObject));
	
	dao.bulkPost(Module.constants.values.CFUTF8Type, returnedLookupRequestObject);
	
	Module.logger.write(Module.constants.levels.INFO, 'Bulk Load Request # Keys: ' + returnedBulkRequestObject.rowkeys.length);	
	Module.logger.write(Module.constants.levels.INFO, 'Bulk Load Request JSON: ' + Module.utilities.toJSON(returnedBulkRequestObject));
	
	dao.bulkPost(Module.constants.values.CFLongType, returnedBulkRequestObject);

	Module.logger.write(Module.constants.levels.INFO, 'Done purging commit log');
	
	this.empty(commitLogFile);

};

exports.FilehandlerManagerModule = FilehandlerManagerModule;