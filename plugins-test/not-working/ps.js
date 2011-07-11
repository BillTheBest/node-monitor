/*
 * ps
 */

// Custom modules
var logger = require('../modules/module-logger');
var utilsModule = require('../modules/module-utils');

logger.setDest('server');
logger.enableConsole(true);
var utils = new utilsModule.UtilsModule();

// Globals
this.name = 'ps';

this.poll = function (callback) {
	var self = this;
	var exec = require('child_process').exec, child;
	child = exec('ps', function (error, stdout, stderr) {
		logger.write('ps: ' + stdout.toString());
		callback(self.name, self.render(), stdout);
	});
}

this.render = function() {
	return {
		type: 'text',
		title: 'ps'
	};
}