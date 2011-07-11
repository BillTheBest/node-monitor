    
var command = 'ps ax | grep -v | grep client';

var exec = require('child_process').exec, child;
child = exec(command, function (error, stdout, stderr) {		
	console.log(stdout.toString());
});


