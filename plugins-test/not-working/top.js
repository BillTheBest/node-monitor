/**
* top
*/

/*
 * Notes: doesn't work on OSX
 */

// Includes
var stack = require('long-stack-traces');
 
var Plugin = {
	name: 'top',
	command: 'top -b -n 1 | head -n 5',
	config: require('../config/node_config')
};

this.name = Plugin.name;

Plugin.format = function(data) {
	data = data.replace('\n', ' ');
	data = data.replace(/\s{2,}/g,' ');
	
	var splitBuffer = [];
	
	splitBuffer = data.split('\n');
			
	for (i = 0; i < splitBuffer.length; i++) {
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

/*
top - 01:45:48 up 6 days, 6:06, 2 users, load average: 209.03, 174.28, 146.97 Tasks: 78 total, 2 running, 76 sleeping, 0 stopped, 0 zombie Cpu(s): 1.7%us, 2.2%sy, 0.0%ni, 92.3%id,  0.0%wa, 0.0%hi, 0.0%si, 3.8%st Mem: 1705708k total, 1645624k used, 60084k free, 76648k buffers Swap: 917500k total, 124k used, 917376k free, 1125924k cached
*/

Plugin.alertCriteria = function() {
	alert_hash = {
		date: new Date(),
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
		var key = Plugin.config.node_name + ':' + Plugin.name;
		var data = Plugin.format(stdout.toString());
		callback(Plugin.name, key, data, Plugin.alertCriteria());
	});
};