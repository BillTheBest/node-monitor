/** 
 * Filehandler Module
 */

// Includes
var stack = require('../lib/long-stack-traces');
var fs = require('fs');
 
// Utilities
var utilsModule = require('./utils');
var utils = new utilsModule.UtilsModule();

// Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// Logging
var logger = require('./logger');

FilehandlerModule = function() {
};

FilehandlerModule.prototype.write = function(fileName, data) {
	fs.open(fileName, 'a', 0666, function(error, fd) {
		if (error)
			logger.write(constants.levels.INFO, 'Error opening file: ' + fileName);
			
		try {	
			fs.write(fd, data, null, 'utf8', function(error, written) {
				logger.write(constants.levels.INFO, 'Writing file');
				if (error)
					logger.write(constants.levels.INFO, 'Error writing to file: ' + fileName);
			});
		} catch (Exception) {
			logger.write(constants.levels.SEVERE, 'There was an error trying to write to a file, is this killing the monitor? ' + Exception);
		}
		
		fs.close(fd, function (error) {
			if (error)
				logger.write(constants.levels.INFO, 'Error closing file: ' + error);
		});
	});
};

FilehandlerModule.prototype.empty = function(fileName) {
	fs.writeFile(fileName, '', function(error){
		if (error)
			logger.write(constants.levels.INFO, 'Error emptying file: ' + error);
				
	});
};

FilehandlerModule.prototype.readDirectory = function (path, callback) {
	var self = this;
	var fileObjectArray = [];
  	fs.readdir(path, function(err, files) {
  		if (files) {
    		var count = files.length; 
    		logger.write(constants.levels.INFO, 'Counted ' + count + ' log files in ' + path + ' to monitor');
    		var countFolders = 0;
    		var data = [];
			
	    	files.forEach(
	    		function (name) {
		      		fs.stat(path + '/' + name, function(err, stat) {
		        		var obj = {};
		        		obj.name = name;
		        		logger.write(constants.levels.INFO, 'Log counted from path ' + path + ' ' + obj.name);
		        		
		        		obj.stat = stat;
		        		data.push(obj);
		        		fileObjectArray.push(data);
		       		 	if (stat.isDirectory()) {
		          			countFolders += 1;
		                    (function(obj2) {
		                     	self.readDirectory(path + '/' + name, function(data2) {
		                         	countFolders -= 1;
		              				obj2.children = data2;
		              				if (countFolders <= 0) {
		              					logger.write(constants.levels.INFO, 'Done finding logs here');
		                			}
		              			});
		          			})(obj);
		        		}
		        		count -= 1;
		        		if (count <= 0) {
		            		if (countFolders <= 0) {
		                  		logger.write(constants.levels.INFO, 'Done finding logs');
		                  	}
			            }
		        	});
	    		}
	    	);
	   	} else {
	   		logger.write(constants.levels.INFO, 'No files in path');
	   	}
		callback();
  	});
};


exports.FilehandlerModule = FilehandlerModule;