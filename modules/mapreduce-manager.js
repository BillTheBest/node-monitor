/**
* We create a separate hive table that maps to the rowkey so we can dump logs that match 
*/
function setupHiveTables(rowKeys) {
	
	/**
	* No connection pool, slow down
	*/
	(function(){
	    var t_count = 0;
	    (function(delay, count) {
    	    	
	        setTimeout(function() {
	            if (count && ++t_count > count) 
	            	return;
	            	
	           	var rowKey = rowKeys[t_count];
	            
	            rowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
			
				var postParams = {
					type: 'standard',
					rowMapping: 'rowkey',
					rowType: 'string'
				};
			
				CloudsandraApi.mapReduceTable(rowKey, postParams, function(response) {
					CloudsandraApi.parseForDisplay(response);
				});
	            	
	            setTimeout(arguments.callee, delay);
	        }, delay);
	    })(1000 * 3, rowKeys.length - 1);
	})();
		
	/**
	* Not sure if this will F* shit up
	*/	
	/*
	rowKeys.forEach(
		function (rowKey) {	
		
			rowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
			
			var postParams = {
				type: 'standard',
				rowMapping: 'rowkey',
				rowType: 'string'
			};
		
			CloudsandraApi.mapReduceTable(rowKey, postParams, function(response) {
				CloudsandraApi.parseForDisplay(response);
			});
		}
	);
	*/
}

/**
* Until json post is allowed for multiple jobs, we create a separate job for each rowkey (day), and put data into Hive
*/
function startLogAggregateJob(cfName, rowKeys, text) {

	/**
	* No connection pool, slow down
	*/
	(function(){
	    var t_count = 0;
	    (function(delay, count) {
    	    	
	        setTimeout(function() {
	            if (count && ++t_count > count) 
	            	return;
	            	
	           	var rowKey = rowKeys[t_count];
	            
	            var hiveTableFromRowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
		
				var postParams = {
					overwriteTable : hiveTableFromRowKey,
					fromTable : cfName,
					select : 'value',
					where : 'rowkey=\'' + rowKey + '\' AND value like \'%' + text + '%\''
				};
			
				CloudsandraApi.mapReduceJob(postParams, function(response) {
					CloudsandraApi.parseForDisplay(response);
				});	
	            	
	            setTimeout(arguments.callee, delay);
	        }, delay);
	    })(1000 * 1, rowKeys.length - 1);
	})();

	/**
	* Not sure if this will F* shit up
	*/
	/*
	rowKeys.forEach(
		function (rowKey) {	
			
			var hiveTableFromRowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
		
			var postParams = {
				overwriteTable : hiveTableFromRowKey,
				fromTable : cfName,
				select : 'value',
				where : 'rowkey=\'' + rowKey + '\' AND value like \'%' + text + '%\''
			};
		
			CloudsandraApi.mapReduceJob(postParams, function(response) {
				CloudsandraApi.parseForDisplay(response);
			});	
		}
	);
	*/
}

/**
* We should probably reduce to a job ID, but for now we can take all results and put them in unique row 'job1', with
* a value that corresponds to today's date
*/
function startReduceToCassandraJob(cfName, reduceKey, rowKeys) {

	/**
	* No connection pool, slow down
	*/
	(function(){
	    var t_count = 0;
	    (function(delay, count) {
    	    	
	        setTimeout(function() {
	            if (count && ++t_count > count) 
	            	return;
	            	
	           	var rowKey = rowKeys[t_count];
	            
	            var hiveTableFromRowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
		
				var postParams = {
					overwriteTable : cfName,
					fromTable : hiveTableFromRowKey,
					select : '\'' + reduceKey + '\', rowkey, \'2011:06:28\''
				};
			
				CloudsandraApi.mapReduceJob(postParams, function(response) {
					CloudsandraApi.parseForDisplay(response);
				});		
	            	
	            setTimeout(arguments.callee, delay);
	        }, delay);
	    })(1000 * 5, rowKeys.length - 1);
	})();

	/**
	* Not sure if this will F* shit up
	*/
	/*
	rowKeys.forEach(
		function (rowKey) {	
			
			var hiveTableFromRowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
		
			var postParams = {
				overwriteTable : cfName,
				fromTable : hiveTableFromRowKey,
				select : '\'job2\', rowkey, \'2011:06:28\''
			};
		
			CloudsandraApi.mapReduceJob(postParams, function(response) {
				CloudsandraApi.parseForDisplay(response);
			});	
		}
	);
	*/
}

function runJobsForTimePeriod(period, key, text) {
	
	var rowKeys = [];

	switch (period) {
		case 'year':
			for (i = 0; i < 365; i++) {
				var time = new Date();
				time.setDate(time.getDate() - i);
				var rowKey = key + ':' + time.getUTCFullYear() + ':' + time.getUTCMonth() + ':' + time.getUTCDate();
				rowKeys.push(rowKey);
			}
			break;
		case 'month':
			for (i = 0; i < 31; i++) {
				var time = new Date();
				time.setDate(time.getDate() - i);
				var rowKey = key + ':' + time.getUTCFullYear() + ':' + time.getUTCMonth() + ':' + time.getUTCDate();
				rowKeys.push(rowKey);
			}
			break;
		case 'week':
			for (i = 0; i < 7; i++) {
				var time = new Date();
				time.setDate(time.getDate() - i);
				var rowKey = key + ':' + time.getUTCFullYear() + ':' + time.getUTCMonth() + ':' + time.getUTCDate();
				rowKeys.push(rowKey);
			}
			break;
		case 'day':
			break;
		default:
			// today
			break;
	}
	
	// Need a callback from CloudSandra to let me know to move on...or I can poll something!
		
	//setupHiveTables(rowKeys);
	startLogAggregateJob('CFLongType', rowKeys, text);
	//startReduceToCassandraJob('MapReduceTest1', 'job5', rowKeys);
}

//setupExternalTables();
//runJobsForTimePeriod('month', '10.202.215.212:logs:_var_log_tomcat6_catalina.out', 'Authenticating');
runJobsForTimePeriod('month', '127.0.0.1:logs:_var_log_system.log', 'Process');