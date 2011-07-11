/**
* Should never have to do this, maybe make a check for these.
*/
function setupExternalTables() {
	var postParams = {
		type: 'external',
		rowMapping: 'rowkey',
		rowType: 'string',
		columnMapping: 'columnname',
		columnType: 'string',
		valueMapping: 'value',
		valueType: 'string',
		cassandraColumnsMapping: ':key,:column,:value'
	};
	
	CloudsandraApi.mapReduceTable('CFUTF8Type', postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
	
	var postParams = {
		type: 'external',
		rowMapping: 'rowkey',
		rowType: 'string',
		columnMapping: 'column_name',
		columnType: 'BIGINT',
		valueMapping: 'value',
		valueType: 'string',
		cassandraColumnsMapping: ':key,:column,:value'
	};
	
	CloudsandraApi.mapReduceTable('CFLongType', postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
}

/**
* We create a separate hive table that maps to the rowkey so we can dump logs that match 
*/
function setupHiveTables(rowKeys) {

	console.log('Setting up Hive tables');
	
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
	            
	            console.log('Setting up Hive table for key: ' + rowKey);
			
				websocketApiRequest(toJSON(POST, MAPREDUCE_TABLE, rowKey, 'standard'));
	            	
	            setTimeout(arguments.callee, delay);
	        }, delay);
	    })(2000, rowKeys.length - 1);
	})();
}

/**
* Until json post is allowed for multiple jobs, we create a separate job for each rowkey (day), and put data into Hive
*/
function startLogAggregateJob(cfName, rowKeys, text) {

	console.log('Starting mapping');

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
	            
	            console.log('Mapping table: ' + hiveTableFromRowKey);
		
				var postParams = {
					overwriteTable : hiveTableFromRowKey,
					fromTable : cfName,
					select : 'value',
					where : 'rowkey=\'' + rowKey + '\' AND value like \'%' + text + '%\''
				};
				
				websocketApiRequest(toJSON(POST, MAPREDUCE_JOB, JSON.stringify(postParams), null));
		    	
	            setTimeout(arguments.callee, delay);
	        }, delay);
	    })(2000, rowKeys.length - 1);
	})();
}

/**
* We should probably reduce to a job ID, but for now we can take all results and put them in unique row 'job1', with
* a value that corresponds to today's date
*/
function startReduceToCassandraJob(cfName, rowKeys) {

	console.log('Starting to reduce to CloudSandra');

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
					select : '\'job2\', rowkey, \'2011:06:28\''
				};
			
				CloudsandraApi.mapReduceJob(postParams, function(response) {
					CloudsandraApi.parseForDisplay(response);
				});		
	            	
	            setTimeout(arguments.callee, delay);
	        }, delay);
	    })(2000, rowKeys.length - 1);
	})();
}

function runJobsForTimePeriod(period, key, text) {

	console.log('Getting rowkeys in time period');
	
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
		
	setupHiveTables(rowKeys);
	
	console.log('Hive tables have been set up ....?');
	
	/*
	setTimeout(
			function() {
				startLogAggregateJob(CFLONGTYPE, rowKeys, text);
			}, 1000 * 20
		);
	*/
	/**
	* Technically, don't start this job until we receive a message.  But we don't have this yet...
	*/
	//startReduceToCassandraJob('MapReduceTest1', rowKeys);
}

//setupExternalTables();
//runJobsForTimePeriod('month', '127.0.0.1:logs:_var_log_system.log', 'Realtime');