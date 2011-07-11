/**
 * Constants Module
 */
 
// Includes
var stack = require('../lib/long-stack-traces');

ConstantsModule = function () {};

ConstantsModule.prototype.values = function () {};

ConstantsModule.prototype.values.SELF = 'server';
ConstantsModule.prototype.values.SETCOUNT = 'set-count';
ConstantsModule.prototype.values.CFUTF8Type = 'CFUTF8Type';
ConstantsModule.prototype.values.CFLongType = 'CFLongType';
ConstantsModule.prototype.values.PAGINATION = '1000';

ConstantsModule.prototype.api = function () {};

ConstantsModule.prototype.api.GET = 'get';
ConstantsModule.prototype.api.POST = 'post';
ConstantsModule.prototype.api.DEL = 'del';

ConstantsModule.prototype.api.SERVER = 'servers';
ConstantsModule.prototype.api.USERS = 'users';
ConstantsModule.prototype.api.CLIENTS = 'clients';
ConstantsModule.prototype.api.INSTANCES = 'instances';
ConstantsModule.prototype.api.LOGS = 'logs';
ConstantsModule.prototype.api.LOG_LIVE = 'log-live';
ConstantsModule.prototype.api.LOG_HISTORY = 'log-history';
ConstantsModule.prototype.api.PLUGINS = 'plugins';
ConstantsModule.prototype.api.PLUGIN_LIVE = 'plugin-live';
ConstantsModule.prototype.api.PLUGIN_HISTORY = 'plugin-history';
ConstantsModule.prototype.api.LOOKUP = 'lookup';
ConstantsModule.prototype.api.ALERTS = 'alerts';
ConstantsModule.prototype.api.ALERTS_LIVE = 'alerts-live';
ConstantsModule.prototype.api.ALERTS_HISTORY = 'alerts-history';
ConstantsModule.prototype.api.CLIENT_TAGS = 'client-tags';
ConstantsModule.prototype.api.CLIENT_EXTERNAL = 'client-external';
ConstantsModule.prototype.api.MAPREDUCE_TABLE = 'mapreduce-table';
ConstantsModule.prototype.api.MAPREDUCE_JOB = 'mapreduce-job';
ConstantsModule.prototype.api.CONNECTIONS = 'connections';
ConstantsModule.prototype.api.CONNECTIONS_LIVE = 'connections-live';
ConstantsModule.prototype.api.CONNECTIONS_TOTAL = 'connections-total';

ConstantsModule.prototype.db = function () {};

ConstantsModule.prototype.db.CLOUDSANDRA = 'cloudsandra';

ConstantsModule.prototype.levels = function () {};

ConstantsModule.prototype.levels.SEVERE = 'SEVERE';
ConstantsModule.prototype.levels.WARNING = 'WARNING';
ConstantsModule.prototype.levels.INFO = 'INFO';
ConstantsModule.prototype.levels.CONFIG = 'CONFIG';
ConstantsModule.prototype.levels.FINE = 'FINE';
ConstantsModule.prototype.levels.DEBUG = 'DEBUG';
ConstantsModule.prototype.levels.ALL = 'ALL';

exports.ConstantsModule = ConstantsModule;
