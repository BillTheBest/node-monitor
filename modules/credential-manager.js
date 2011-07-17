/**
 * credential-manager.js module
 */
 
var fs = require('fs'); 
 
var Module = {};

CredentialManagerModule = function (childDeps) {

	for (var name in childDeps) {
		eval('var ' + name + ' = require(\'' + childDeps[name] + '\')');
	}

	var constants = new constantsManager.ConstantsManagerModule();
	
	Module = this;
	
	Module.constants = constants;
				
}; 

CredentialManagerModule.prototype.check = function() {

	var checkCredentialsArray = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'TWILIO_SID', 'TWILIO_TOKEN', 'CLOUDSANDRA_TOKEN', 'CLOUDSANDRA_ACCOUNT'];

	checkCredentialsArray.forEach(
		function (credential) {
			var check = process.env[credential];
			if (!check)
				Module.exit(credential + ' is not declared');
				
		}
	);
	
	try {
		Module.constants.credentials.AWS_ACCESS_KEY_ID = process.env['AWS_ACCESS_KEY_ID'];
	} catch (Exception) {
		Module.exit('Error with credentials');
	}

	try {
		Module.constants.credentials.AWS_SECRET_ACCESS_KEY = process.env['AWS_SECRET_ACCESS_KEY'];
	} catch (Exception) {
		Module.exit('Error with credentials');
	}	
	
	try {
		Module.constants.credentials.TWILIO_SID = process.env['TWILIO_SID'];
	} catch (Exception) {
		Module.exit('Error with credentials');
	}
	
	try {
		Module.constants.credentials.TWILIO_TOKEN = process.env['TWILIO_TOKEN'];
	} catch (Exception) {
		Module.exit('Error with credentials');
	}
	
	try {
		Module.constants.credentials.CLOUDSANDRA_TOKEN = process.env['CLOUDSANDRA_TOKEN'];
	} catch (Exception) {
		Module.exit('Error with credentials');
	}
	
	try {
		Module.constants.credentials.CLOUDSANDRA_ACCOUNT = process.env['CLOUDSANDRA_ACCOUNT'];
	} catch (Exception) {
		Module.exit('Error with credentials');
	}
	
};

CredentialManagerModule.prototype.exit = function(message) {
	
	console.log(message + ', exiting application');
	process.exit(1);
	
};

exports.CredentialManagerModule = CredentialManagerModule;
