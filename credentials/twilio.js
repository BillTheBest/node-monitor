/**
* Twilio credentials, constants
*/

// Includes
var stack = require('../lib/long-stack-traces'); 
 
TwilioModule = function() {
  	this.m_count = 0;
};

TwilioModule.prototype.credentials = function() {
  	this.m_count++;
};

TwilioModule.prototype.credentials.SID		= '';
TwilioModule.prototype.credentials.TOKEN	= '';

TwilioModule.prototype.constants = function() {
  	this.m_count++;
};

TwilioModule.prototype.constants.NUMBER			= '+4155992671';

exports.TwilioModule = TwilioModule;