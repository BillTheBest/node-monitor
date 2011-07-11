function parseWebsocketUsersRequest(jsonObject) {
	
	$(USERS_COUNT_DIV).empty();
	$(USERS_DIV).empty();

	switch(jsonObject.request) {
	
		/**
		* Request returns a list of current users, which we parse to menu
		*/
		case GET:
		
			console.log('VALIdATING: ' + validateJSON(jsonObject));
			var userArray = [];
			uptimeArray = {};
			
			$.each(JSON.parse(jsonObject.data), function(user, uptime) {
				userArray.push(user);
    			uptimeArray[user] = uptime;
        	});

			userArray.forEach (
				function (user) {
					$(USERS_DIV).append('<li><a href="#" title="' + user +'" onclick=setUser("' + user + '") >' + user +'</a></li>');
				}
			);
			
			$(USERS_COUNT_DIV).append(userArray.length);
			break;
			
		/**
		* This is the first request made, the server initiates the rest of the calls
		*/
		case POST:
			showNotification('Connected as user: ' + jsonObject.data, 'Success');
			/**
			 * On connection, session - a user - gets set
			 */
			if (connectionId)
				websocketApiRequest(toJSON(DEL, USERS, '', null));
				
			connectionId = jsonObject.data;
			console.log('Connection ID: ' + connectionId);
			
			/**
			 * Call the default page setup here, after we've established a websocket connection and set the current user
			 */
			defaultPageSetup();
			
			break;
	}
}

function parseWebsocketServerRequest(jsonObject) {

	$(SERVERS_COUNT_DIV).empty();
	$(SERVERS_DIV).empty();
	
	switch(jsonObject.request) {
		/**
		* Request returns a list of servers, which we parse to menu (future load balancing could allow for more than 1)
		*/
		case GET:
			var serverArray = [];
			var uptimeArray = {};
					
			$.each(JSON.parse(jsonObject.data), function(server, uptime){
        		serverArray.push(server);
    			uptimeArray[server] = uptime;
        	});
							
			serverArray.forEach (
				function (server) {
					$(SERVERS_DIV).append('<li><a href="#" title="' + server +'" onclick=setServer("' + server + '") >' + server +'</a></li>');
					$(SERVERS_DIV).append('<section class="sidebar nested"><h2>Info:</h2><p>Up since: ' + uptimeArray[server] + '</p></section>');
				}
			);
			
			$(SERVERS_COUNT_DIV).append(serverArray.length);
			break;
		case POST:
			break;
	}
}

function parseWebsocketClientsRequest(jsonObject) {

	switch(jsonObject.request) {
	
		/**
		* Request returns a list of all clients, ever, wait until we receive tag data to append ?
		*/
		case GET:
			clientArray = [];
			clientCheckObject = {};
			
			$.each(JSON.parse(jsonObject.data), function(client, uptime) {			
        		clientArray.push(client);
    			clientCheckObject[client] = uptime;
        	});
        	        				
			break;
		case POST:
			break;
	}
}

/**
* Request returns a list of client IP addresses, internal and external
*/
function parseWebsocketClientExternalRequest(jsonObject) {
	switch(jsonObject.request) {
		case GET:			
					
			$.each(JSON.parse(jsonObject.data), function(internalIP, externalIP) {
				
				console.log('Internal: ' + internalIP);
				console.log('External: ' + externalIP);
							
				clientExternalObject[internalIP] = externalIP;
        	});
        			
			break;
		case POST:		
			break;
	}
}

/**
* Request returns a list of ec2-instances, so we can compare what is deployed and what is not, 
* we also add tags in to make it easier on the eyes
*/
var instancesRequest = false;
function parseWebsocketInstancesRequest(jsonObject) {

	$(EC2_TABLE).empty();
	
	var instanceIdArray = [];
	var instanceNameArray = [];
	var groupIdArray = [];
	var groupNameArray = [];
		
	jsonObject.data.forEach(
  		function (returnedInstanceObjects) {
		
			$.each(returnedInstanceObjects.instanceIds, function(instanceId, instanceName) {	
				instanceIdArray.push(instanceId);
				instanceNameArray.push(instanceName);
   			});
			
			var groupCount = 0;
			$.each(returnedInstanceObjects.securityGroups, function(groupId, groupName) {	
				groupIdArray.push(groupId);
				groupNameArray.push(groupName);
   			});
 			
  		}
  	);
  	
  	
  	var instanceCount = 0;
   	var position = 0;   
  	
  	instanceNameArray.forEach(
		function (instanceName) {
			
			var instanceId = instanceIdArray[position];
			var groupId = groupIdArray[position];
			var groupName = groupNameArray[position];
			
			if ($.inArray(instanceName, clientArray) != -1) {
				if (clientTagData[instanceName]) {
					$(EC2_TABLE).append('<tr><td>' + instanceId +'</td><td><b style="font-size: 14px">' + clientTagData[instanceName] +'</b></td><td>' + groupName + '</td><td>' + groupId +'</td><td><span class="tag green">Yes</span></td><td><ul class="actions"><li><a class="delete" href="#" title="Undeploy" rel="tooltip">Stop monitoring</a></li></ul></td></tr>');
				} else {
					$(EC2_TABLE).append('<tr></td><td>' + instanceId +'</td><td>' + instanceName +'</td><td>' + groupName + '</td><td>' + groupId +'</td><td><span class="tag green">Yes</span></td><td><ul class="actions"><li><a class="delete" href="#" title="Undeploy" rel="tooltip">Stop monitoring</a></li></ul></td></tr>');
				}
			} else {
				$(EC2_TABLE).append('<tr><td>' + instanceId +'</td><td>' + instanceName +'</td><td>' + groupName + '</td><td>' + groupId +'</td><td><span class="tag red">No</span></td><td><ul class="actions"><li><a class="delete" href="#" title="Undeploy" rel="tooltip">Stop monitoring</a></li></ul></td></tr>');
			}
			
			instanceCount++;
			position++;
			
		}
	);
	
	// Need to do the fix for datables (separate objects)
	var table = $("#ec2-table");
	if (table == undefined) {
		$("#ec2-table").dataTable();
	} else {
	
	}	
  	
  	numberBar(EC2_INSTANCES_COUNT, instanceCount * 3, 'EC2 Intances', PREPEND);
	
}

function parseWebsocketLogsRequest(jsonObject) {	

	$('#log-list').empty();

	$(LOGS_COUNT_DIV).empty();
	$(LOGS_DIV).empty();
	
	switch(jsonObject.request) {
	
		/**
		* Request returns a list of logs from a client, parsed into menu
		*/
		case GET:
			var logArray = [];

			$.each(JSON.parse(jsonObject.data), function(log, uptime) {
        		logArray.push(log);
        	});
			
			logArray.forEach (
				function (log) {
					$(LOGS_DIV).append('<li><a href="#" title="' + log +'" onclick=setLog("' + log + '") >' + log +'</a></li>');
					$('#log-list').append('<ul class="list-style-cross"><li><img onClick=deleteLog("' + log + '") style="display: inline; border: 0;" src="./img/trash.png"> ' + log + '</li></ul>');	
				}
			);
			
			$(LOGS_COUNT_DIV).append(logArray.length);
			$('#log-list').prepend('<ul class="stats-summary"><li><strong class="stats-count">' + logArray.length + '</strong><p>Logs</p></li>');
			
			break;
		case POST:
			break;
	}
}

function parseWebsocketLogLiveRequest(jsonObject) {

	var logTablePart1 = '<table style="width: 1050px" class="datatable' + logTableCount.toString() + '" id="log-table"><thead><tr><th style="width: 150px">Date</th><th style="margin-right: 10px" >Log</th><th></th></tr></thead><tbody id="log-table-body">';
	var logTablePart2 = '';
	var logTablePart3 = '</tbody><tfoot><tr><th>Date</th><th>Log</th><th></th></tr></tfoot></table>';
	
	switch(jsonObject.request) {
	
		/**
		* Request returns log entries by day, parsed into a paginatable table
		*/
		case GET:	
		
			var thisLogSetCount = 0;
		
			console.log('Log entry count before new set: ' + logEntryCount);		
					
			$.each(JSON.parse(jsonObject.data), function(uptime, logEntry) {
			
				logEntryCount++;
				thisLogSetCount++;
				
				date = new Date(parseInt(uptime));
				var time = date.getHours() + ':' + date.getMinutes();
				
				var jsonObject = JSON.parse(unescape(logEntry));
				
				if (thisLogSetCount == paginationRate) {
					lastLogEntry = jsonObject.date;
					console.log('Last log entry date, for pagination, is : ' + lastLogEntry);
				}

				logTablePart2 += '<tr><td>' + date + ' ' + time + '</td><td style="margin-right: 10px" ><b>' + jsonObject.returned + '</b></td><td></td></tr>';
        	});

			$(LOG_TABLE_CONTAINER).empty();
			$(LOG_ENTRY_COUNT_DIV).empty();
			
			console.log('Logs in this set: ' + thisLogSetCount);
			console.log('Log entry count is up to: ' + logEntryCount);
			
			/**
			* Check for pagination 
			*/
			if (logEntryCount >= paginationRate) {
				
			} 
			
			$(LOG_TABLE_CONTAINER).append(logTablePart1 + logTablePart2 + logTablePart3);
			break;
		case POST:
			break;
	}
	
	$('.datatable' + logTableCount.toString()).dataTable();	
}

function parseWebsocketLogsHistoryRequest(jsonObject) {

}

function parseWebsocketPluginsRequest(jsonObject) {

	$('#plugin-list').empty();

	$(PLUGINS_COUNT_DIV).empty();
	$(PLUGINS_DIV).empty();
	
	switch(jsonObject.request) {
	
		/**
		* Request returns a list of plugins
		*/
		case GET:
			var pluginArray = [];
			
			$.each(JSON.parse(jsonObject.data), function(plugin, uptime) {
        		pluginArray.push(plugin);
        	});
			
			pluginArray.forEach (
				function (plugin) {
					$(PLUGINS_DIV).append('<li><a href="#" title="' + plugin +'" onclick=setPlugin("' + plugin + '") >' + plugin +'</a></li>');
					$('#plugin-list').append('<ul class="list-style-cross"><li><img onClick=deletePlugin("' + plugin + '") style="display: inline; border: 0;" src="./img/trash.png"> ' + plugin + '</li></ul>');	
				}
			);
				
			$(PLUGINS_COUNT_DIV).append(pluginArray.length);
			$('#plugin-list').prepend('<ul class="stats-summary"><li><strong class="stats-count">' + pluginArray.length + '</strong><p>Plugins</p></li>');
			break;
		case POST:
			break;
	}
}

/**
* Request returns plugins entries by day, parsed into a graph/table, dear god this is sloppy and drunken and hurried
* Need to store parsing/chart config in plugin info, also clean this up once everything is working -- must fix SOON
*/
function parseWebsocketPluginLiveRequest(jsonObject) {
	
	pluginEntryCount = 0;

	$(PLUGIN_CHART_CONTAINER).empty();
	$(PLUGIN_ENTRY_COUNT_DIV).empty();
	
	addBreadcrumbs(['Home', 'Clients', ip, 'Plugins']);
	changeTitle(ip + ' || ' + plugin)
	
	switch(jsonObject.request) {
	
		case GET:
		
			switch(plugin) {
			
				case 'free':
				
					var dataSet = [];
					var dateSet = [];
					var maxSet = [];
				
					$.each(JSON.parse(jsonObject.data), function(uptime, pluginEntry) {					
						
						pluginEntryCount++;
								
						var jsonObject = JSON.parse(unescape(pluginEntry));
				
						var date = new Date(parseInt(jsonObject.date));			
						dataSet = [date.getTime(), parseInt(jsonObject.value)];
						
						dateSet.push(dataSet);
		        		maxSet.push(parseInt(jsonObject.value));

		        	});
		        	
		        	var chartParams = {};
		        	chartParams[0] = dateSet;
		        	chartParams[1] = maxSet.max();
				
					renderPluginChart(plugin, chartParams);
					renderPluginCount(pluginEntryCount);
					
					break;
				
				case 'df':
				
					var dataSet = [];
					var dateSet = [];
					var maxSet = [];
				
					$.each(JSON.parse(jsonObject.data), function(uptime, pluginEntry) {					
						
						pluginEntryCount++;
								
						var jsonObject = JSON.parse(unescape(pluginEntry));
				
						var date = new Date(parseInt(jsonObject.date));			
						dataSet = [date.getTime(), parseInt(jsonObject.value)];
						
						dateSet.push(dataSet);
		        		maxSet.push(parseInt(jsonObject.value));

		        	});
		        	
		        	var chartParams = {};
		        	chartParams[0] = dateSet;
		        	chartParams[1] = maxSet.max();
				
					renderPluginChart(plugin, chartParams);
					renderPluginCount(pluginEntryCount);
					
					break;
					
				case 'lsof':
				
					var dataSet = [];
					var dateSet = [];
					var maxSet = [];

					$.each(JSON.parse(jsonObject.data), function(uptime, pluginEntry) {
						
						pluginEntryCount++;
								
						var jsonObject = JSON.parse(unescape(pluginEntry));
				
						var date = new Date(parseInt(jsonObject.date));			
						dataSet = [date.getTime(), parseInt(jsonObject.value)];
						
						dateSet.push(dataSet);
		        		maxSet.push(parseInt(jsonObject.value));
						
		        	});
		        	
		        	var chartParams = {};
		        	chartParams[0] = dateSet;
		        	chartParams[1] = maxSet.max();
				
					renderPluginChart(plugin, chartParams);
					renderPluginCount(pluginEntryCount);
										
					/*
					var pluginDate = new Date(pluginChartDate);	
					openRealtimePluginChannel(safeEncode(TOKEN + '/' + CFLONGTYPE + '/' + PLUGINS + ':' + plugin + keyDate));
					*/

					break;	
					
				case 'daemons':
				
					var dataSet = [];
					var dateSet = [];
					var maxSet = [];

					$.each(JSON.parse(jsonObject.data), function(uptime, pluginEntry) {
						
						pluginEntryCount++;
								
						var jsonObject = JSON.parse(unescape(pluginEntry));
				
						var date = new Date(parseInt(jsonObject.date));			
						dataSet = [date.getTime(), parseInt(jsonObject.returned)];
						
						dateSet.push(dataSet);
		        		maxSet.push(parseInt(jsonObject.value));
						
		        	});
		        	
		        	var chartParams = {};
		        	chartParams[0] = dateSet;
		        	chartParams[1] = maxSet.max();
				
					renderPluginChart(plugin, chartParams);
					renderPluginCount(pluginEntryCount);

					break;
					
				case "iostat":
					var dataSet1 = [];
					var dataSet2 = [];
					var dateSet1 = [];
					var dateSet2 = [];
					var maxSet1 = [];
					var maxSet2 = [];
					
					$.each(JSON.parse(jsonObject.data), function(uptime, pluginEntry) {					
						pluginEntryCount++;
						
						var jsonObject = JSON.parse(unescape(pluginEntry));
				
						date = new Date(parseInt(jsonObject.date));		
						
						console.log('DISK0: ' + jsonObject.disk0.mbs);
						console.log('CPU: ' + jsonObject.cpu.us);
						
						dataSet1 = [date.getTime(), parseInt(jsonObject.disk0.mbs)];
						dataSet2 = [date.getTime(), parseInt(jsonObject.cpu.us)];
						dateSet1.push(dataSet1);
						dateSet2.push(dataSet2);
		        		
		        		maxSet1.push(parseInt(jsonObject.disk0.mbs));
		        		maxSet2.push(parseInt(jsonObject.cpu.us));

		        	});
		        	
		        	iostatChart(dateSet1, dateSet2, maxSet1.max(), maxSet2.max(), 'Uptime', 'Tooltip');
					
					var pluginDate = new Date(pluginChartDate);
						
					openRealtimePluginChannel(safeEncode(TOKEN + '/' + CFLONGTYPE + '/' + PLUGINS + ':' + plugin + keyDate));
	
					$(PLUGIN_ENTRY_COUNT_DIV).prepend('<ul class="stats-summary"><li><strong class="stats-count">' +  pluginEntryCount.toString() + '</strong><p>Entries</p></li>');
					break;
					
				case "filesize":
				
					var dataSet = [];
					var dateSet = [];
					var maxSet = [];

					$.each(JSON.parse(jsonObject.data), function(uptime, pluginEntry) {
						pluginEntryCount++;
						
						var jsonObject = JSON.parse(unescape(pluginEntry));
				
						date = new Date(parseInt(jsonObject.date));			
						dataSet = [date.getTime(), parseInt(jsonObject.value)];
						dateSet.push(dataSet);
		        		
		        		maxSet.push(parseInt(jsonObject.value));
		        	});
						
					staticPluginDateChart(dateSet, maxSet.max(), 'Filesize', 'Tooltip');
					
					var pluginDate = new Date(pluginChartDate);
						
					openRealtimePluginChannel(safeEncode(TOKEN + '/' + CFLONGTYPE + '/' + PLUGINS + ':' + plugin + keyDate));
					
					$(PLUGIN_ENTRY_COUNT_DIV).prepend('<ul class="stats-summary"><li><strong class="stats-count">' +  pluginEntryCount.toString() + '</strong><p>Entries</p></li>');
					break;
			}		
			break;
		case POST:
			break;
	}
}

function parseWebsocketPluginHistoryRequest(jsonObject) {

}

var alertEntryCount = 0;
function parseWebsocketAlertLiveRequest(jsonObject) {

	$(RECENT_ALERTS_COUNT_DIV).empty();
	$(RECENT_ALERTS_DIV).empty();
	
	switch(jsonObject.request) {
		/**
		* Request returns alert entries by day, parsed into dashboard
		*/
		case GET:
			var alertArrayEntry = [];
			
			$.each(JSON.parse(jsonObject.data), function(uptime, alert) {
        		alertEntryCount++;
					
				var date = new Date(parseInt(uptime.substr(0, 10)));
				
				$(RECENT_ALERTS_DIV).prepend('<li><span class="logs-timestamp"></span><h4>Entry: ' + unescape(unescape(alert)) + '</h4></li>');
				
				alertArrayEntry.push(unescape(unescape(alert)));
        	});
			
			if (alertEntryCount >= paginationRate) {
				$(RECENT_ALERTS_COUNT_DIV).prepend('<ul class="stats-summary"><li><strong class="stats-count">+' +  alertEntryCount.toString() + '</strong><p>Alerts Today</p></li>');
			} else {
				$(RECENT_ALERTS_COUNT_DIV).prepend('<ul class="stats-summary"><li><strong class="stats-count">' +  alertEntryCount.toString() + '</strong><p>Alerts Today</p></li>');
			}
			break;
		case POST:
			break;
	}
}

function parseWebsocketAlertHistoryRequest(jsonObject) {

}

/**
* Check to see if the client has a tag associated with it, as well
* as the last time it reported.  We display only clients that haven't reported in last 10 minutes
* as being down.  Need to get sorting working.
*/
function parseWebsocketClientTagsRequest(jsonObject) {
	
	$(CLIENTS_DOWN_DIV).empty();
	$(CLIENTS_COUNT_DIV).empty();
	$(CLIENTS_DIV).empty();
	
	var clientsNotResponding = 0;
	var clientsResponding = 0;

	switch(jsonObject.request) {
		case GET:			
			var clientTagObject = {};
			
			$.each(JSON.parse(jsonObject.data), function(clientIP, clientTag) {
				clientTagObject[clientIP] = clientTag;
        	});
        	
        	clientTagData = clientTagObject;
        	
        	var clientsWithTags = [];
        	var clientsWithoutTags = [];
        	var clientsNotRespondingDataSet1 = [];
        	var clientsNotRespondingDataSet2 = [];
        	
        	clientArray.forEach(
        		function (client) {
        			
        			if (clientTagData[client]) {
        				clientsWithTags.push(client);
        			} else {
        				clientsWithoutTags.push(client);
        			}
        			
        		}
        	);
        	
        	clientsWithTags = clientsWithTags.sort();
        	
        	clientsWithTags.forEach (
				function (client) {
				
					var lastTimeClientReported = clientCheckObject[client];
					var now = new Date().getTime();
					var difference = now - lastTimeClientReported;
					
					if (difference > 1000 * 60 * 10) {
						
						clientsNotResponding++;
						
						clientsNotRespondingDataSet1.push(clientTagData[client]);	
						clientsNotRespondingDataSet2.push(Math.round((difference / 1000) / 60));
							
						$(CLIENTS_DOWN_DIV).append('<ul class="list-style-cross"><li><img onClick=deleteClient("' + client + '") style="display: inline; border: 0;" src="./img/trash.png"> ' + clientTagData[client] + '</li></ul>');
						$(CLIENTS_DIV).append('<li><a href="#" title="' + client +'" onclick=setClient("' + client + '") ><b>' + clientTagData[client] + '</b></a></li>');
					} else {
						clientsResponding++;
					
						$(CLIENTS_DIV).append('<li><a href="#" title="' + client +'" onclick=setClient("' + client + '") >' + clientTagData[client] + '</a></li>');
					}
					
				}
			);
			
			clientsWithoutTags.forEach(
				function (client) {
				
					var lastTimeClientReported = clientCheckObject[client];
					var now = new Date().getTime();
					var difference = now - lastTimeClientReported;
					
					if (difference > 1000 * 60 * 10) {
						
						clientsNotResponding++;
						
						clientsNotRespondingDataSet1.push(client);
						clientsNotRespondingDataSet2.push(Math.round((difference / 1000) / 60));
					
						$(CLIENTS_DOWN_DIV).append('<ul class="list-style-cross"><li><img onClick=deleteClient("' + client + '") style="display: inline; border: 0;" src="./img/trash.png"> ' + client + '</li></ul>');	
						$(CLIENTS_DIV).append('<li><a href="#" title="' + client +'" onclick=setClient("' + client + '") ><b>' + client + '</b></a></li>');
					} else {
						clientsResponding++;
						$(CLIENTS_DIV).append('<li><a href="#" title="' + client +'" onclick=setClient("' + client + '") >' + client + '</a></li>');
					}
				
				}
			);
        							
			$(CLIENTS_DOWN_DIV).prepend('<ul class="stats-summary"><li><strong class="stats-count">' + clientsNotResponding +'</strong><p>Clients Not Reporting</p></li></ul>');
			$(CLIENTS_COUNT_DIV).append(clientArray.length);
			
			var pieChart;

		   pieChart = new Highcharts.Chart({
		   	  credits: {
	  			enabled: false
	  		  },
		      chart: {
		         renderTo: 'down-client-chart-container-1',
		         plotBackgroundColor: null,
		         plotBorderWidth: null,
		         plotShadow: false
		      },
		      title: {
		         text: 'Status'
		      },
		      tooltip: {
		         formatter: function() {
		            return '<b>'+ this.point.name +'</b>: '+ this.y +' %';
		         }
		      },
		      plotOptions: {
		         pie: {
		            allowPointSelect: true,
		            cursor: 'pointer',
		            dataLabels: {
		               enabled: true,
		               color: '#000000',
		               connectorColor: '#000000',
		               formatter: function() {
		                  return '<b>'+ this.point.name +'</b>: '+ this.y +' %';
		               }
		            }
		         }
		      },
		       series: [{
		         type: 'pie',
		         name: 'Browser share',
		         data: [
		            [clientsResponding + ' Reporting',   Math.round((((clientsResponding / (clientsNotResponding + clientsResponding))) * 100))],
		            {
		               name: clientsNotResponding + ' Not Reporting', 
		               color: '#aa4643',   
		               y: Math.round((((clientsNotResponding / (clientsNotResponding + clientsResponding))) * 100)),
		               sliced: true,
		               selected: true
		            },
		         ]
		      }]
		   });
		   
		   $('#clients-count-chart').append('<ul class="stats-summary"><li><strong class="stats-count">' + (clientsNotResponding + clientsResponding) +'</strong><p>Clients</p></li></ul>');

			/**
			* This chart is only useful if we have multiple clients down...say > 3 because it's pretty
			*/
		   if (clientsNotResponding >= 3) {
				var chart;
			   	chart = new Highcharts.Chart({
			   	  credits: {
	  				 enabled: false
	  			  },
			      chart: {
			         renderTo: 'down-client-chart-container',
			         defaultSeriesType: 'column',
			         margin: [ 50, 100, 100, 80]
			      },
			      title: {
			         text: 'Time Down'
			      },
			      xAxis: {
			         categories: clientsNotRespondingDataSet1,
			         labels: {
			            rotation: -30,
			            align: 'right',
			            style: {
			                font: 'normal 13px Verdana, sans-serif'
			            }
			         }
			      },
			      yAxis: {
			         min: 0,
			         title: {
			            text: 'Time (minutes)'
			         }
			      },
			      legend: {
			         enabled: false
			      },
			      tooltip: {
			         formatter: function() {
			            return '<b>'+ this.x +'</b><br/>'+
			                'Time not monitored: '+ Highcharts.numberFormat(this.y, 1) +
			                ' minutes';
			         }
			      },
			      series: [{
			         name: 'Clients',
			         data: clientsNotRespondingDataSet2,
			         dataLabels: {
			            enabled: true,
			            rotation: -90,
			            color: '#FFFFFF',
			            align: 'right',
			            x: -3,
			            y: 10,
			            formatter: function() {
			               return this.y;
			            },
			            style: {
			               font: 'normal 13px Verdana, sans-serif'
			            }
			         }         
			      }]
			   });
			}
			
			break;
		case POST:		
			break;
	}
}

function parseWebsocketMapReduceTableRequest(jsonObject) {

}

function parseWebsocketMapReduceJobRequest(jsonObject) {

}