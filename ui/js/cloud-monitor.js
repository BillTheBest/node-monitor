function initCloudMonitor() {
    openWebsocketServerConnection();
    addBreadcrumbs(['Home', 'Dashboard']);
    changeTitle('Dashboard');
    if (!ip) {
        $(LOGS_CONTAINER).hide();
        $(PLUGINS_CONTAINER).hide();
        $(SERVERS_TAB_LINK).hide();
        $(CLIENTS_TAB_LINK).hide();
        $(LOGS_TAB_LINK).hide();
        $(PLUGINS_TAB_LINK).hide();
    }
}
/**
 * Always go back to dashboard on reconnection
 */

function openWebsocketServerConnection() {
    goToTab(DASHBOARD_TAB, DASHBOARD_TAB_LINK, DASHBOARD_TAB_LINK_HREF);
    websocketServerConnection = new WebSocket(serverWebsocketUrl);
    websocketServerConnection.onclose = function () {
        showNotification('API WebSocket closed, reconnecting', 'Error');
        setTimeout(function () {
            openWebsocketServerConnection();
        }, 1000 * 5);
    };
    websocketServerConnection.onopen = function () {
        /*
         * Wait until connectionId is set to grab data
         */
    };
    websocketServerConnection.onmessage = function (event) {
        websocketApiHandler(event);
    };
}

function websocketApiRequest(jsonObject) {
    websocketServerConnection.send(jsonObject);
}

function defaultPageSetup() {
    /*
     * List of connected clients
     */
    websocketApiRequest(toJSON(GET, CLIENTS, '', null));
    /* 
     * Server information
     */
    websocketApiRequest(toJSON(GET, SERVER, '', null));
    /*
     * List of client tags
     */
    websocketApiRequest(toJSON(GET, CLIENT_TAGS, '', null));
    /*
     * List of client IP addresses
     */
    websocketApiRequest(toJSON(GET, CLIENT_EXTERNAL, '', null));
    /* 
     * List of connected users
     */
    websocketApiRequest(toJSON(GET, USERS, '', null));
    /*
     * List of today's alerts
     */
    websocketApiRequest(toJSON(GET, ALERTS_LIVE, '', null));
    /*
     * List of EC2 instances
     */
    websocketApiRequest(toJSON(GET, INSTANCES, '', null));
}

function openRealtimeAlertChannel(channel) {
	console.log('Opening realtime channel: ' + channel);
    var client = isidoreyInit(channel, function rtCallback(raw) {
        console.log('Realtime message: ' + JSON.stringify(raw));
        
        var jsonObject = JSON.parse(JSON.stringify(raw));
        console.log('json data: ' + jsonObject.Namespace);
        
        $(RECENT_ALERTS_DIV).prepend('<li><span class="logs-timestamp"></span><h4>Entry: ' + unescape(JSON.stringify(raw)) + '</h4></li>');
        //$(RECENT_ALERTS_DIV).prepend('<div class="message"><p>' + JSON.stringify(raw) + '</p><p><strong>' + new Date() + '</strong></p></div>');
    });
}

function openRealtimePluginChannel(channel) {}

function openRealtimeLogChannel(channel) {
    console.log('Opening realtime channel: ' + channel);
    var client = isidoreyInit(channel, function rtCallback(raw) {
        console.log('Realtime message: ' + JSON.stringify(raw));
        $(REALTIME_LOGS_DIV).prepend('<div class="message"><p>' + JSON.stringify(raw) + '</p><p><strong>' + new Date() + '</strong></p></div>');
    });
}
/**
 * Manage websocket connections data
 */

function openWebsocketClientConnection(REALTIME_DIV) {
    incomingMessagesCount = 0;
    incomingLogCount = 0;
    var resetMessagesCount = 0;
    var resetLogsCount = 0;
    
    websocketClientConnection = new WebSocket(clientWebsocketUrl);
    websocketClientConnection.onclose = function () {};
    websocketClientConnection.onopen = function () {
        console.log('Opened a websocket connection: ' + clientWebsocketUrl);
        $(REALTIME_DIV).empty();
        $(REALTIME_LOGS_DIV).empty();
    };
    websocketClientConnection.onmessage = function (event) {
         
        incomingMessagesCount++;
        resetMessagesCount++
        
         $(INCOMING_MESSAGES_COUNT_DIV).empty();
	     $(INCOMING_MESSAGES_COUNT_DIV).prepend('<ul class="stats-summary"><li><strong class="stats-count">' + incomingMessagesCount.toString() + ' </strong><p>Live Messages Received</p></li>');
        
        /**
        * When we click on the scrollbar, we set this to false.
        */
        if (appendMessages) {
        
	        if (resetMessagesCount > 1000) {
	        	resetMessagesCount = 0;
	        	$(REALTIME_DIV).empty();
	        }
	            
	        var json;
	        json = JSON.parse(event.data);
	        
	        if (isEven(incomingMessagesCount)) {
	            $(REALTIME_DIV).prepend('<ul class="stats-summary" style=><li><strong class="stats-count">' + json.key + ' </strong><p style="text-align: left; font-size: 16px; width: 700px;">' + event.data + '</p></li>');
	        } else {
	            $(REALTIME_DIV).prepend('<ul class="stats-summary"><li><strong class="stats-count">' + json.key + ' </strong><p style="text-align: left; font-size: 16px; width: 700px;">' + event.data + '</p></li>');
	        }
	        
	        switch (json.name) {
		        case LOGS:
		        
		            incomingLogCount++;
		            resetLogsCount++
		            
		            $(INCOMING_LOG_COUNT_DIV).empty();
			        $(INCOMING_LOG_COUNT_DIV).prepend('<ul class="stats-summary"><li><strong class="stats-count">' + incomingLogCount.toString() + ' </strong><p>Live Logs Received</p></li>');
		            
		            /**
		            * When we click on the scrollbar, we set this to false
		            */
		            if (appendLogs) {
		            
			            if (resetLogsCount > 1000) {
			            	resetLogsCount = 0;
			            	$(REALTIME_LOGS_DIV).empty();
			            }
			            
			            var jsonLog = JSON.parse(json.data);
			            var dateBolded = jsonLog.returned.substring(0, 20);
		
			            if (json.key == ip + ':' + LOGS + ':' + log + keyDate) {
			             
			                if (isEven(incomingMessagesCount)) {
			                    $(REALTIME_LOGS_DIV).prepend('<ul class="stats-summary" style=><li><strong class="stats-count">' + dateBolded + ' </strong><p style="text-align: left; font-size: 16px; width: 700px;">' + jsonLog.returned + '</p></li>');
			                } else {
			                    $(REALTIME_DIV).prepend('<ul class="stats-summary"><li><strong class="stats-count">' + dateBolded + ' </strong><p style="text-align: left; font-size: 16px; width: 700px;">' + jsonLog.returned + '</p></li>');
			                }
			            }
			            
			         }
		            break;
	        }
	  	}
    };
}

function closeWebsocketClientConnection() {
    console.log('Closing websocket connection to client if one exists');
    if (websocketClientConnection != undefined) {
        websocketClientConnection.close();
        $(INCOMING_MESSAGES_COUNT_DIV).empty();
        console.log('Closed websocket connection!');
        showNotification('Client WebSocket closed', 'Alert');
    }
}

function websocketApiHandler(event) {
    var jsonObject = fromJSON(event.data);
    var innerJsonObject;
    // Don't know why this is not the same, fix!
    if (jsonObject.type == INSTANCES) {
        parseWebsocketInstancesRequest(jsonObject);
    } else {
        innerJsonObject = JSON.parse(jsonObject.data);
        console.log('Request returned: ' + event.data);
        var type;
        type = jsonObject.type;
        if (innerJsonObject.status == '400') {
            showNotification('<b>Failed call: </b>' + innerJsonObject.detail, 'Error');
        } else {
            if (type != undefined) {
                switch (type) {
                case SERVER:
                    parseWebsocketServerRequest(jsonObject);
                    break;
                case USERS:
                    parseWebsocketUsersRequest(jsonObject);
                    break;
                case CLIENTS:
                    parseWebsocketClientsRequest(jsonObject);
                    break;
                case LOGS:
                    parseWebsocketLogsRequest(jsonObject);
                    break;
                case LOG_LIVE:
                    parseWebsocketLogLiveRequest(jsonObject);
                    break;
                case LOG_HISTORY:
                    break;
                case PLUGINS:
                    parseWebsocketPluginsRequest(jsonObject);
                    break;
                case PLUGIN_LIVE:
                    parseWebsocketPluginLiveRequest(jsonObject);
                    break;
                case PLUGIN_HISTORY:
                    parseWebsocketPluginHistoryRequest(jsonObject);
                    break;
                case ALERTS_LIVE:
                    parseWebsocketAlertLiveRequest(jsonObject);
                    break;
                case ALERTS_HISTORY:
                    parseWebsocketAlertHistoryRequest(jsonObject);
                    break;
                case CLIENT_TAGS:
                    parseWebsocketClientTagsRequest(jsonObject);
                    break;
                case CLIENT_EXTERNAL:
                    parseWebsocketClientExternalRequest(jsonObject);
                    break;
                case MAPREDUCE_TABLE:
                    parseWebsocketMapReduceClientRequest(jsonObject);
                    break;
                case MAPREDUCE_JOB:
                    parseWebsocketMapReduceJobRequest(jsonObject);
                    break;
                }
            } else {
                console.log('Ignoring event, bad request possibly');
            }
        }
    }
}