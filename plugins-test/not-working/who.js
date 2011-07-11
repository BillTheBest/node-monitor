/*
 * who
 */

// Custom modules
var logger = require('../modules/module-logger');
var utilsModule = require('../modules/module-utils');

logger.setDest('server');
logger.enableConsole(true);
var utils = new utilsModule.UtilsModule();

// Globals
this.name = 'who';

this.poll = function (callback) {	
	var self = this;
	var exec = require('child_process').exec, child;
	child = exec('who', function (error, stdout, stderr) {
		logger.write('who formatted: ' + utils.format(self.name, stdout.toString()));
		var jsonMessage = utils.toJSON(config.node_name + ':who', utils.format(self.name, stdout.toString()));
		callback(self.name, self.render(), jsonMessage);
	});
}

this.render = function() {
	return {
		type: 'text',
		title: 'who'
	};
}