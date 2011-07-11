function showNotification(message, type) {
	//$(NOTIFICATIONS_DIV).slideDown('fast');
	$(NOTIFICATIONS_DIV).empty();
	$(NOTIFICATIONS_DIV).show();
	switch (type) {
		case 'Error':
			$(NOTIFICATIONS_DIV).prepend('<!-- Notification --><div class="notification error" ><a href="#" class="close-notification" title="Hide Notification" rel="tooltip">x</a><p><strong>Error notification</strong> ' + message + '.</p></div><!-- /Notification -->');
			break;
		case 'Success':
			$(NOTIFICATIONS_DIV).prepend('<!-- Notification --><div class="notification success"><a href="#" class="close-notification" title="Hide Notification" rel="tooltip">x</a><p><strong>Success notification</strong> ' + message + '.</p></div><!-- /Notification -->');
			break;
		case 'Info':	
			$(NOTIFICATIONS_DIV).prepend('<!-- Notification --><div class="notification information"><a href="#" class="close-notification" title="Hide Notification" rel="tooltip">x</a><p><strong>Information notification</strong> ' + message +'.</p></div><!-- /Notification -->');
			break;
		case 'Attention':
			$(NOTIFICATIONS_DIV).prepend('<!-- Notification --><div class="notification attention"><a href="#" class="close-notification" title="Hide Notification" rel="tooltip">x</a><p><strong>Attention notification</strong> ' + message +'.</p></div><!-- /Notification -->');
			break;
		case 'Note':
			$(NOTIFICATIONS_DIV).prepend('<!-- Notification --><div class="notification note"><a href="#" class="close-notification" title="Hide Notification" rel="tooltip">x</a><p><strong>Note</strong> ' + message +'.</p></div><!-- /Notification -->');
			break;
	}
	(function(){
	    var t_count = 0;
	    (function(delay, count) {
	        setTimeout(function() {
	            if (count && ++t_count > count) 
	            	return;
	            
	            //$(NOTIFICATIONS_DIV).slideUp('fast');
	            $(NOTIFICATIONS_DIV).hide();
	            setTimeout(arguments.callee, delay);
	        }, delay);
	    })(2000, 2);
	})();
}	

function addWidget(type, data) {	
	switch(type) {
		case 'Up':
			$(WIDGETS_DIV).prepend('<!-- Widget Box --><div class="widget increase" id="new-visitors"><a href="#" class="close-widget" title="Hide Widget" rel="tooltip">x</a><span>increase</span><p><strong>+35,18<sup>%</sup></strong> +2489 new visitors</p></div><!-- /Widget Box -->');
			break;
		case 'Down':
			$(WIDGETS_DIV).prepend('<!-- Widget Box --><div class="widget decrease" id="new-orders"><a href="#" class="close-widget" title="Hide Widget" rel="tooltip">x</a><span>decrease</span><p><strong>-12,50<sup>%</sup></strong> -311 new orders</p></div><!-- Widget Box -->');
			break;
		case 'Number':
			$(WIDGETS_DIV).prepend('<!-- /Widget Box --><div class="widget increase" id="new-tasks"><a href="#" class="close-widget" title="Hide Widget" rel="tooltip">x</a><span>7</span><p><strong>Tasks</strong> +3 New Tasks</p></div><!-- Widget Box -->');
			break;
		case 'Text':
			$(WIDGETS_DIV).prepend('<!-- /Widget Box --><div class="widget text-only" id="text-widget"><a href="#" class="close-widget" title="Hide Widget" rel="tooltip">x</a><p><strong>Job Set ID: ' + data +'</strong> Job Set Qued</p></div><!-- /Widget Box -->');
			break;
		case 'Add':
			$(WIDGETS_DIV).prepend('<div class="widget add-new-widget"><a href="#"><span>Add</span><strong>Add Widget</strong></a></div>');
			break;
	}
}

function changeTitle(title) {
	$(TITLE_DIV).empty();
	$(TITLE_DIV).append('<h2 id="header-title">[ ' + title +' ]</h2>');
}

function addBreadcrumbs(linkArray) {
	$(BREADCRUMBS_DIV).empty();
	$(BREADCRUMBS_DIV).append('<li><a href="index.html" title="Home">Home</a></li>');
	
	var lastItem = linkArray.last();
	linkArray.forEach(
		function(link) {
			if (lastItem == link) {
				$(BREADCRUMBS_DIV).append('<li>' + link + '</li>');
				if (link == 'Users' || link == 'EC2' || link == 'Dashboard')
					changeTitle(link);
				
				if (link == 'Client')
					changeTitle(ip + ' || ' + clientTagData[ip]);
				
				if (link == 'Logs')
					changeTitle(log);
				
				if (link == 'Plugins') 
					changeTitle(plugin);

			} else {
				$(BREADCRUMBS_DIV).append('<li><a href="#">' + link +'</a></li>');
			}
		}
	);
}

function numberBar(DIV_ID, number, text, type) {
	$(DIV_ID).empty();
	switch(type) {
		case PREPEND:
			$(DIV_ID).prepend('<ul class="stats-summary"><li><strong class="stats-count">' + number +'</strong><p>' + text + '</p></li></ul>');
			break;
		case APPEND:
			$(DIV_ID).append('<ul class="stats-summary"><li><strong class="stats-count">' + number +'</strong><p>' + text + '</p></li></ul>');
			break;
	}
}

function progressBar(DIV_ID, number, size, type) {
	$(DIV_ID).empty();
	switch(type) {
		case 'Green':
			$(DIV_ID).append('<!-- Progress Bar --><div class="progress-bar green ' + size +'"><div style="width:' + number +'%;"><span>' + number +'<sup>%</sup></span></div></div><!-- /Progress Bar -->');
			break;
		case 'Red':
			$(DIV_ID).append('<!-- Progress Bar --><div class="progress-bar red ' + size + '"><div style="width:' + number +'%;"><span>' + number +'<sup>%</sup></span></div></div><!-- /Progress Bar -->');
			break;
		case 'Blue':
			$(DIV_ID).append('<!-- Progress Bar --><div class="progress-bar blue ' + size + '"><div style="width:' + number +'%;"><span>' + number +'<sup>%</sup></span></div></div><!-- /Progress Bar -->');
			break;
	}
}

function setServer(selectedServer) {	
	$(SERVERS_TAB_LINK).show();
	if (selectedServer == server) {
		/*
		 * Ignore this server
		 */
		showNotification('Already watching server: ' + server, 'Attention');
	} else {
	
	
		server = selectedServer;
		
		if (server == '127.0.0.1') {
			serverWebsocketUrl = 'ws://127.0.0.1:8001';
		} else {
			serverWebsocketUrl = 'ws://ec2-174-129-229-190.compute-1.amazonaws.com:8001';
		}
	
		showNotification('Watching server: ' + server, 'Info');
		addBreadcrumbs(['Home', 'Server', server]);
		unSetClient();
		
		initCloudMonitor();
		
		ip = undefined;
	}
}
		
function setClient(selectedClient) {	
	$(CLIENTS_TAB_LINK).show();
	
	if (selectedClient == ip) {
		/*
		 * Ignore this client
		 */
		showNotification('Already watching client: ' + ip, 'Attention');
	} else {
		ip = selectedClient;
	
		showNotification('Watching client: ' + ip, 'Info');
		addBreadcrumbs(['Home', 'Clients', ip]);
		changeTitle(ip + ' || ' + clientTagData[ip]);
		unSetLog();
		unSetPlugin();
		$(LOGS_TAB_LINK).hide();
		
		//$('a#client-tab-1').select();
		
		/**
		 * Navigate to client tab
		 */
		goToTab(CLIENTS_TAB, CLIENTS_TAB_LINK, CLIENTS_TAB_LINK_HREF);
		
		/**
		* Close old client connection, sleep, open up websocket connection for realtime streams
		*/
		closeWebsocketClientConnection();
		
		setTimeout(
			function() {
				clientWebsocketUrl = 'ws://' + clientExternalObject[ip] + ':8002';
				openWebsocketClientConnection(REALTIME_CLIENTS_DIV);
			}, 2000
		);
				
		$(LOGS_CONTAINER).show();
		$(PLUGINS_CONTAINER).show();
		
		websocketApiRequest(toJSON(GET, LOGS, ip, null));
		websocketApiRequest(toJSON(GET, PLUGINS, ip, null));
	}	
}

function deleteClient(selectedClient) {

	websocketApiRequest(toJSON(DEL, CLIENTS, selectedClient, null));
	
	setTimeout(
		function() {
			 websocketApiRequest(toJSON(GET, CLIENTS, '', null));
			 websocketApiRequest(toJSON(GET, CLIENT_TAGS, '', null));
		}, 3000
	);
}

function deletePlugin(selectedPlugin) {

	$(PLUGIN_CONFIG_LIST).prepend('<span style="margin: 0 auto; margin-bottom: 20px; margin-left: 20px;" class="loader red" title="Loading, please wait&#8230;"></span><br/><br/>');
	
	websocketApiRequest(toJSON(DEL, PLUGINS, ip, selectedPlugin));
	
	setTimeout(
		function() {
			 websocketApiRequest(toJSON(GET, PLUGINS, ip, null));
		}, 3000
	);
}

function deleteLog(selectedLog) {
	
	$(LOG_CONFIG_LIST).prepend('<span style="margin: 0 auto; margin-bottom: 20px; margin-left: 20px;" class="loader red" title="Loading, please wait&#8230;"></span><br/><br/>');

	websocketApiRequest(toJSON(DEL, LOGS, ip, selectedLog));
	
	setTimeout(
		function() {
			 websocketApiRequest(toJSON(GET, LOGS, ip, null));
		}, 3000
	);
}

function setLog(selectedLog) {
	if (selectedLog == log) {
		/*
		 * Ignore this log
		 */
		showNotification('Already watching log: ' + log, 'Attention');
		
		/*
		 * Navigate to log tab
		 */
		goToTab(LOGS_TAB, LOGS_TAB_LINK, LOGS_TAB_LINK_HREF);
	} else {
		log = selectedLog;
		
		$(LOGS_TAB_LINK).show();
		
		/**
		* Reset
		*/
		logEntryCount = 0;
		logTableCount++;
		incomingLogCount = 0;
			
		showNotification('Watching log: ' + log, 'Info');
		addBreadcrumbs(['Home', 'Clients', ip, 'Logs', log]);
		changeTitle(log);
		unSetPlugin();
		
		
		// Testing
		$(REALTIME_LOGS_DIV).empty();
		$(INCOMING_LOG_COUNT_DIV).empty();
		
		/*
		 * Initially, get today's log info
		 */
		updateLogsByDate(0);
				
		/*
		 * Open realtime channel
		 */
		openRealtimeLogChannel(TOKEN + '/' + CFLONGTYPE + '/' + safeEncode(ip + ':' + LOGS + ':' + log + keyDate));
		
		/*
		 * Navigate to log tab
		 */
		goToTab(LOGS_TAB, LOGS_TAB_LINK, LOGS_TAB_LINK_HREF);
		
	}
}
	
function setPlugin(selectedPlugin) {
	if (selectedPlugin == plugin) {
		/*
		 * Ignore this plugin
		 */
		showNotification('Already watching plugin: ' + plugin, 'Attention');
	} else {
		plugin = selectedPlugin;
	
		showNotification('Watching plugin: ' + plugin, 'Info');
		addBreadcrumbs(['Home', 'Clients', ip, 'Plugins', plugin]);
		changeTitle(plugin);
		//unSetLog();
		
		/*
		 * Initially, get today's plugin info
		 */
		updatePluginsByDate(0);
		
		/* 
		 * Navigate to plugin tab
		 */
		goToTab(PLUGINS_TAB, PLUGINS_TAB_LINK, PLUGINS_TAB_LINK_HREF);
	}
}

function updateLogsByDate(day) {	
	switch (day) {
	 	case '-1':		
	 		logDate = logDate - 86400000;
			websocketApiRequest(toJSON(GET, LOG_LIVE, formatLogKey(log, logDate), null));
	 		break;
	 	case '1':
	 		logDate = logDate + 86400000;
	 		websocketApiRequest(toJSON(GET, LOG_LIVE, formatLogKey(log, logDate), null));
	 		break;
	 	default:
	 		logDate = todaysTime;
	 		websocketApiRequest(toJSON(GET, LOG_LIVE, formatLogKey(log, todaysTime), null));
	 		break;
	}
	
	
	
	var tempDate = new Date(logDate);
		
	$(LOG_DATE_DIV).empty();
	$(LOG_DATE_DIV).append(tempDate.getUTCFullYear() + '/' + tempDate.getUTCMonth() + '/' + tempDate.getUTCDate());
	
	
	$(LOG_TABLE_CONTAINER).empty();
	$(LOG_ENTRY_COUNT_DIV).empty();
	$(LOG_TABLE_CONTAINER).append('<span style="margin: 0 auto; margin-bottom: 20px;" class="loader red" title="Loading, please wait&#8230;"></span>');

}

function updatePluginsByDate(day) {
	switch (day) {
	 	case '-1':		
	 		pluginChartDate = pluginChartDate - 86400000;
			websocketApiRequest(toJSON(GET, PLUGIN_LIVE, formatPluginKey(plugin, pluginChartDate), null));
	 		break;
	 	case '1':
	 		pluginChartDate = pluginChartDate + 86400000;
	 		websocketApiRequest(toJSON(GET, PLUGIN_LIVE, formatPluginKey(plugin, pluginChartDate), null));
	 		break;
	 	default:
	 		pluginChartDate = todaysTime;
	 		websocketApiRequest(toJSON(GET, PLUGIN_LIVE, formatPluginKey(plugin, todaysTime), null));
	 		break;
	} 
	pluginEntryCount = 0;
	
	var tempDate = new Date(pluginChartDate);
	
	$(PLUGIN_CHART_TITLE_DIV).empty();
	$(PLUGIN_CHART_TITLE_DIV).prepend(tempDate.getUTCFullYear() + '/' + tempDate.getUTCMonth() + '/' + tempDate.getUTCDate());
}

function setAlert(selectedDate) {
	websocketApiRequest(toJSON(GET, ALERTS_LIVE, date, null));
}

function setTab(selectedTab) {
	CURRENT_TAB = selectedTab;
}

function goToTab(tab, tabLink, tabHrefLink) {
	$(tabLink).show(
		function() {
			$(tabHrefLink).parent().siblings().find('a').removeClass('current');
			$(tabHrefLink).addClass('current');
			$(tab).siblings('.tab').hide();
			$(tab).show();
			$(tab).find('.data').trigger('visualizeRefresh');
			return false;
		}
	);
}

function nextLogSet() {
	
	$(LOG_TABLE_CONTAINER).prepend('<span style="margin: 0 auto; margin-bottom: 20px; margin-left: 20px;" class="loader red" title="Loading, please wait&#8230;"></span><br/><br/>');

	if (lastLogEntry != undefined) {
		console.log('We have more than paginatable records, so making pagination call');
		websocketApiRequest(toJSON(GET, LOG_LIVE, formatLogKey(log, todaysTime), lastLogEntry));
	}
}

function previousLogSet() {

}

var mapReducePeriod;
function updateMapReducePeriod(period) {
	mapReducePeriod = period;
	$('span#map-reduce-period').empty();
	$('span#map-reduce-period').append(mapReducePeriod);
}

/**
* Future job set will get returned and appended in DIV
*/
function submitMapReduceJobSet() {
	var text = $('#log-mapreduce-text').val();
	console.log('Should be adding widget, plus this text: ' + text);
	addWidget('Text', 'N/A');
	if (mapReducePeriod == undefined) {
		runJobsForTimePeriod('day', ip + ':' + LOGS + ':' + log, text);
	} else {
		runJobsForTimePeriod(mapReducePeriod, ip + ':' + LOGS + ':' + log, text);
	}
}

function setClientTag() {
	var newTag = $('input#client-tag-input').val();
	
	// Premature
	showNotification('Updated Tag for Client: ' + ip, 'Success');
	
	websocketApiRequest(toJSON(POST, CLIENT_TAGS, ip, newTag)); 
	websocketApiRequest(toJSON(GET, CLIENT_TAGS, '', null));
	
}

function unSetServer() {
	server = undefined;
}

function unSetClient() {
	ip = undefined;
	$(CLIENTS_TAB_LINK).hide();
}

function unSetLog() {
	log = undefined;
}

function unSetPlugin() {
	plugin = undefined;
}
