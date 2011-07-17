/* 
 * Notifier Module
 */
 
// Includes
var stack = require('../lib/long-stack-traces');

// Utilities
var utilsModule = require('./utils');
var utils = new utilsModule.UtilsModule();

// Constants
var constantsModule = require('./constants');
var constants = new constantsModule.ConstantsModule();

// Logging
var logger = require('./logger');

// Credentials
var twilioModule = require('../credentials/twilio');
var twilio = new twilioModule.TwilioModule();

TwilioClient = require('twilio').Client;
twilioClient = new TwilioClient(twilio.credentials.SID, twilio.credentials.TOKEN, 'node.js-monitor-notify-test');

NotifyModule = function() {
};

NotifyModule.prototype.callOut = function() {
	var phone = twilioClient.getPhoneNumber(twilio.constants.NUMBER);
	phone.setup(function() {
	    phone.makeCall('+7206210099', null, function(call) {
	        call.on('answered', function(reqParams, res) {
	            console.log('Call answered');
	            res.append(new Twiml.Say('This is node dot j s monitor reporting in.'));
	            res.send();
	        });
	        call.on('ended', function(reqParams) {
	            console.log('Call ended');
	        });
	    });		
	});
};

NotifyModule.prototype.sendSms = function(message) {
};

NotifyModule.prototype.sendEmail = function(title, message) { 
	// Use AWS
};

NotifyModule.prototype.notify = function(message) {
};

exports.NotifyModule = NotifyModule;