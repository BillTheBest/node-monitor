/**
 * constants-manager.js module
 */

ConstantsManagerModule = function () {

};

ConstantsManagerModule.prototype.values = function () {

};

ConstantsManagerModule.prototype.values.SELF = 'server';
ConstantsManagerModule.prototype.values.SETCOUNT = 'set-count';
ConstantsManagerModule.prototype.values.CFUTF8Type = 'CFUTF8Type';
ConstantsManagerModule.prototype.values.CFLongType = 'CFLongType';
ConstantsManagerModule.prototype.values.PAGINATION = '1000';

ConstantsManagerModule.prototype.api = function () {

};

ConstantsManagerModule.prototype.api.GET = 'get';
ConstantsManagerModule.prototype.api.POST = 'post';
ConstantsManagerModule.prototype.api.DEL = 'del';

ConstantsManagerModule.prototype.api.SERVER = 'servers';
ConstantsManagerModule.prototype.api.SERVER_VERSIONS = 'server-versions';
ConstantsManagerModule.prototype.api.SERVER_EXTERNAL = 'server-external';
ConstantsManagerModule.prototype.api.SERVER_PLATFORM = 'server-platform';
ConstantsManagerModule.prototype.api.USERS = 'users';
ConstantsManagerModule.prototype.api.CLIENTS = 'clients';
ConstantsManagerModule.prototype.api.INSTANCES = 'instances';
ConstantsManagerModule.prototype.api.LOGS = 'logs';
ConstantsManagerModule.prototype.api.LOGS_PID = 'logs-pid';
ConstantsManagerModule.prototype.api.LOG_LIVE = 'log-live';
ConstantsManagerModule.prototype.api.LOG_HISTORY = 'log-history';
ConstantsManagerModule.prototype.api.PLUGINS = 'plugins';
ConstantsManagerModule.prototype.api.PLUGIN_LIVE = 'plugin-live';
ConstantsManagerModule.prototype.api.PLUGIN_HISTORY = 'plugin-history';
ConstantsManagerModule.prototype.api.LOOKUP = 'lookup';
ConstantsManagerModule.prototype.api.ALERTS = 'alerts';
ConstantsManagerModule.prototype.api.ALERTS_LIVE = 'alerts-live';
ConstantsManagerModule.prototype.api.ALERTS_HISTORY = 'alerts-history';
ConstantsManagerModule.prototype.api.CLIENT_TAGS = 'client-tags';
ConstantsManagerModule.prototype.api.CLIENT_VERSIONS = 'client-versions';
ConstantsManagerModule.prototype.api.CLIENT_PLATFORM = 'client-platform';
ConstantsManagerModule.prototype.api.CLIENT_EXTERNAL = 'client-external';
ConstantsManagerModule.prototype.api.MAPREDUCE_TABLE = 'mapreduce-table';
ConstantsManagerModule.prototype.api.MAPREDUCE_JOB = 'mapreduce-job';
ConstantsManagerModule.prototype.api.CONNECTIONS = 'connections';
ConstantsManagerModule.prototype.api.CONNECTIONS_LIVE = 'connections-live';
ConstantsManagerModule.prototype.api.CONNECTIONS_TOTAL = 'connections-total';
ConstantsManagerModule.prototype.api.COMMAND = 'command';
ConstantsManagerModule.prototype.api.COMMAND_STOP_TAILING = 'command-stop-tailing';
ConstantsManagerModule.prototype.api.COMMAND_START_TAILING = 'command-start-tailing';
ConstantsManagerModule.prototype.api.COMMAND_UPLOAD_PLUGIN = 'command-upload-plugin';
ConstantsManagerModule.prototype.api.COMMAND_REMOVE_PLUGIN = 'command-remove-plugin';
ConstantsManagerModule.prototype.api.COMMAND_ADD_CONFIG = 'command-add-config';
ConstantsManagerModule.prototype.api.COMMAND_REMOVE_CONFIG = 'command-remove-config';
ConstantsManagerModule.prototype.api.COMMAND_UPDATE_CONFIG = 'command-update-config';

ConstantsManagerModule.prototype.db = function () {

};

ConstantsManagerModule.prototype.db.CLOUDSANDRA = 'cloudsandra';

ConstantsManagerModule.prototype.levels = function () {

};

ConstantsManagerModule.prototype.levels.SEVERE = 'SEVERE';
ConstantsManagerModule.prototype.levels.WARNING = 'WARNING';
ConstantsManagerModule.prototype.levels.INFO = 'INFO';
ConstantsManagerModule.prototype.levels.CONFIG = 'CONFIG';
ConstantsManagerModule.prototype.levels.FINE = 'FINE';
ConstantsManagerModule.prototype.levels.DEBUG = 'DEBUG';
ConstantsManagerModule.prototype.levels.ALL = 'ALL';

ConstantsManagerModule.prototype.credentials = function () {

};

ConstantsManagerModule.prototype.credentials.AMAZON_ID;
ConstantsManagerModule.prototype.credentials.AMAZON_KEY;
ConstantsManagerModule.prototype.credentials.TWILIO_SID;
ConstantsManagerModule.prototype.credentials.TWILIO_TOKEN;
ConstantsManagerModule.prototype.credentials.TWILIO_NUMBER = '+4155992671';
ConstantsManagerModule.prototype.credentials.CLOUDSANDRA_TOKEN;
ConstantsManagerModule.prototype.credentials.CLOUDSANDRA_ACCOUNT;

exports.ConstantsManagerModule = ConstantsManagerModule;
