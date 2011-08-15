var TOKEN			= 'FiAywji7ra';

/**
* CloudSandra
*/
	var CFLONGTYPE = 'CFLongType';
	var CFUTF8Type = 'CFUTF8Type';

/**
* API
*/
	var GET 			= 'get';
	var POST			= 'post';
	var DEL 			= 'del';
	
	var SERVER 			= 'servers';
	var USERS			= 'users';
	var CLIENTS 		= 'clients';
	var INSTANCES		= 'instances';
	var PLUGINS 		= 'plugins';
	var PLUGIN_LIVE 	= 'plugin-live';
	var PLUGIN_HISTORY 	= 'plugin-history';
	var LOGS 			= 'logs';	
	var LOG_LIVE 		= 'log-live';
	var LOG_HISTORY 	= 'log-history';
	var LOOKUP 			= 'lookup';
	var ALERTS 			= 'alerts';
	var ALERTS_LIVE 	= 'alerts-live';
	var ALERTS_HISTORY 	= 'alerts-history';
	var CLIENT_TAGS 	= 'client-tags';
	var CLIENT_EXTERNAL	= 'client-external';
	var MAPREDUCE_TABLE	= 'mapreduce-table';
	var MAPREDUCE_JOB	= 'mapreduce-job';

var $element;
var $monthElement;
var $dayElement;
var $weekElement;

var PREPEND = 'prepend';
var APPEND = 'append';

var CURRENT_PAGE = 'HOME';
var CURRENT_TAB;
var TITLE_DIV = '#header-title-container';
var BREADCRUMBS_DIV = 'ul#breadcrumbs';
var NOTIFICATIONS_DIV = '#alerts';
var WIDGETS_DIV = 'section#widgets-container';

/**
* Tabs
*/
	var SERVERS_TAB_LINK = 'li#server-tab-link-container';

	var DASHBOARD_TAB_LINK = 'li#dashboard-tab-link-container';
	var DASHBOARD_TAB = '#tab0';
	var DASHBOARD_TAB_LINK_HREF = 'a#dashboard-tab-link';

	var CLIENTS_TAB_LINK = 'li#client-tab-link-container';
	var CLIENTS_TAB = '#tab2';
	var CLIENTS_TAB_LINK_HREF = 'a#client-tab-link';
	
	var LOGS_TAB_LINK = 'li#log-tab-link-container';
	var LOGS_TAB = '#tab6';
	var LOGS_TAB_LINK_HREF = 'a#log-tab-link';
	
	var PLUGINS_TAB_LINK = 'li#plugin-tab-link-container';
	var PLUGINS_TAB = '#tab7';
	var PLUGINS_TAB_LINK_HREF = 'a#plugin-tab-link';
	
/**
* Realtime (websockets)
*/
	var REALTIME_CLIENTS_DIV = '#realtime-clients';
	var REALTIME_LOGS_DIV = '#realtime-logs';
	var INCOMING_MESSAGES_COUNT_DIV = '#incoming-realtime-count';
	var INCOMING_LOG_COUNT_DIV = '#incoming-realtime-log-count';

/**
* Menu
*/
var SERVERS_COUNT_DIV = 'span#servers-count';
var SERVERS_DIV = 'ul#server';

var USERS_COUNT_DIV = 'span#users-count';
var USERS_DIV = 'ul#users';

var PLUGINS_CONTAINER = 'li#plugins-container';
var LOGS_CONTAINER = 'li#logs-container';

var CLIENTS_COUNT_DIV = 'span#clients-count';
var CLIENTS_DIV = 'ul#clients';

var LOG_ENTRY_COUNT_DIV = "#log-entry-count";
var LOGS_COUNT_DIV = 'span#logs-count';
var LOGS_DIV = 'ul#logs';
var LOG_DATE_DIV = '#log-date';

var PLUGINS_COUNT_DIV = 'span#plugins-count';
var PLUGINS_DIV = 'ul#plugins';

var EC2_INSTANCES_COUNT = '#ec2-instances-count';
var EC2_TABLE = 'tbody#ec2-table';

var LOG_TABLE_CONTAINER = '#log-table-container';
var LOG_TABLE_BODY = 'tbody#log-table-body';
var LOG_TABLE = 'table#log-table';

var RECENT_ALERTS_DIV = 'ul#recent-alerts';
var RECENT_ALERTS_COUNT_DIV = '#recent-alerts-count';

var PLUGIN_ENTRY_COUNT_DIV = '#plugin-entry-count';
var PLUGIN_CHART_CONTAINER = '#plugin-charts-container';
var PLUGIN_CHART_TITLE_DIV = 'h2#plugin-chart-title-div';

var CLIENTS_DOWN_COUNT_DIV;
var CLIENTS_DOWN_DIV = '#clients-down';

var PLUGIN_CONFIG_LIST = '#plugin-list';
var LOG_CONFIG_LIST = '#log-list';

var today = new Date();
var todaysTime = today.getTime();

var pluginChartDate = today.getTime();
var logDate = today.getTime();
var keyDate = ':' + today.getUTCFullYear() + ':' + today.getUTCMonth() + ':' + today.getUTCDate();

/**
* States
*/
	var connectionId;
	var server;
	var ip;
	var log;
	var plugin;
	var command;
	var connected;
	var logCount;
	var logIndexCount;
	var instanceCount;
	var instanceCountSet = false;
	
	var clientExternalObject = {};
	var clientArray = [];
	var clientCheckObject = {};
	var clientTagData = {};
	
	var lastLogEntry;
	var pluginEntryCount = 0;
	var logTableCount = 0;
	var logEntryCount = 0;
	var incomingMessagesCount;
	var incomingLogCount;
	var paginationRate = 1000;
	
	var appendLogs = true;
	var appendMessages = true;

/**
* Websockets
*/
	var websocketClientConnection;
	var clientWebsocketUrl;
	
	var websocketServerConnection;
	
	//var serverWebsocketUrl = 'ws://127.0.0.1:8001';
	var serverWebsocketUrl = 'ws://ec2-50-16-144-4.compute-1.amazonaws.com:8001';