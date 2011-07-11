/**
 * iostat
 */

// Includes
var stack = require('../lib/long-stack-traces');

// Utilities
var utilsModule = require('../modules/utils');
var utils = new utilsModule.UtilsModule();

// Constants
var constantsModule = require('../modules/constants');
var constants = new constantsModule.ConstantsModule();

// Logging
var logger = require('../modules/logger');
 
var Plugin = {
	name: 'iostat',
	command: 'iostat',
	config: require('../config/config')
};

this.name = Plugin.name;

Plugin.format = function(data) {
	var header = 'disk0       cpu     load average';
	var splitBuffer = [];
	splitBuffer = data.split('\n');
	
	var i = 0;
	if (data.match(header))
		i = 1;
			
	for (i; i < splitBuffer.length; i++) {
		var output_array = data.replace(/^\s+|\s+$/g,'').split(/\s+/);
    	if (output_array) {    
      		for (var j = 0; j < output_array.length; j++) {
        		output_array[j] = parseFloat(output_array[j]);
      		};
      		var array_length = output_array.length;
      		output_hash = {
        		date: new Date(),
        		disk0: {
          			kbt: output_array[array_length-9],
          			tps: output_array[array_length-8],
          			mbs: output_array[array_length-7],
        		},
        		cpu: {
          			us: output_array[array_length-6],
          			sy: output_array[array_length-5],
          			id: output_array[array_length-4],
        		},
        		load_average: {
          			m1: output_array[array_length-3],
          			m5: output_array[array_length-2],
          			m15: output_array[array_length-1],
        		}
      		};
      		return JSON.stringify(output_hash);	
		}
	}
};

Plugin.alertCriteria = function() {
	alert_hash = {
		date: new Date().getTime(),
		disk0: {
  			kbt: null,
  			tps: null,
  			mbs: null,
		},
		cpu: {
  			us: JSON.stringify(json = {
					alert: {
						comparator: '>',
						value: 70
					}
				}),
  			sy: null,
  			id: null,
		},
		load_average: {
  			m1:  null,
  			m5:  null,
  			m15: null,
		}
	};
	return JSON.stringify(alert_hash);
};

this.poll = function (callback) {	
	var exec = require('child_process').exec, child;
	child = exec(Plugin.command, function (error, stdout, stderr) {		
		var key = utils.formatPluginKey(Plugin.config.clientIP, Plugin.name);
		var data = Plugin.format(stdout.toString());
		logger.write(constants.levels.INFO, Plugin.name + ' Data: ' + data);
		callback(Plugin.name, key, data, Plugin.alertCriteria());
	});
};
