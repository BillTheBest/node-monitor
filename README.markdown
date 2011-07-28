node-monitor
=====

Development - v0.5
-----------------------------------

Lots of really great features are taking shape, some release notes to build on (not yet released):
	
	Auto-configuration of boxes for both client and server
	Differentiation of platforms in core and plugin/module templates
	Re-architecture of dependencies for cleaner handling
	Actual server handling connection management
	Chaos monkey kills client to server connection every 5 minutes
	Added statuses of requests to log
	Added version to self store and separated clients/servers better
	Add multiple drive size check support
	Fixed issue with bulk posting 
	Added RESPONSE tag to logs
	Added counters to logs/plugins
	Added error handling to DAO
	Began to implement word indexing by log
	
This is a monitoring application built on today's technologies centered around CloudSandra, Node.js, and the Amazon EC2/CloudWatch APIs.  REST and websockets for historical and realtime views of what's happening on our boxes, combined with Chromatron and Highcharts (along with lots of jQuery functionality) together in a UI piece that interacts with a websocket API.  This is crucial, as it allows us to make server-side API calls for big data, have a cleaner (no PHP/AJAX) UI, and keep credentials on the server side.

Products I Admire
-----------------------------------

http://www.loggly.com/product/

http://www.splunk.com

Screenshots
-----------------------------------

The main dashboard shows the amount of clients (boxes) being monitored.  It shows any clients that are down, and how long.  We also have a COMET channel open to listen for alerts coming in, as well as grabbing alerts for today (based on plugin criterion).

![SS1](http://dev.isidorey.net/docs/screenshots/cloud-monitor-1.png)
![SS2](http://dev.isidorey.net/docs/screenshots/cloud-monitor-2.png)


![SS3](http://dev.isidorey.net/docs/screenshots/cloud-monitor-3.png)


![SS4](http://dev.isidorey.net/docs/screenshots/cloud-monitor-4.png)
![SS5](http://dev.isidorey.net/docs/screenshots/cloud-monitor-5.png)
![SS6](http://dev.isidorey.net/docs/screenshots/cloud-monitor-6.png)
![SS7](http://dev.isidorey.net/docs/screenshots/cloud-monitor-7.png)
![SS8](http://dev.isidorey.net/docs/screenshots/cloud-monitor-8.png)
![SS11](http://dev.isidorey.net/docs/screenshots/cloud-monitor-11.png)
![SS12](http://dev.isidorey.net/docs/screenshots/cloud-monitor-12.png)
![SS14](http://dev.isidorey.net/docs/screenshots/cloud-monitor-14.png)
	
General
-----------------------------------
	
Set ulimits HIGH (4000 at least)

Make sure ports are open on both client and server - (client) 9997/8002 (server) 9997/8001/8002

Make sure IPs are correctly set in configs

Make sure you edit plugin configs and logs to monitor

Move monitor start script to /monitoring, add amazon creds to command line

Make sure permissions for all node folders are for user (ubuntu/ec2-user), especially after git clone

Usage/Installation
-----------------------------------

	// DEBIAN 
	
	mkdir /monitoring
	sudo ./monitor install-debian
	
	// CentOS	
	
	mkdir /monitoring
	sudo ./monitor install-centos
	
	sudo ./monitor start

Architecture
-----------------------------------

All clients post monitoring/log data to CloudSandra

	Client1 => REST => CloudSandra
	Client2 => REST => CloudSandra 

2 websocket connections are open, one for all REST requests from the UI 

	UI => Websocket => Server => REST => CloudSandra
	UI <= Websocket <= Server 

	UI <= Websocket <= Client

We also have a connection open between the server and client which allows us to handle changes on the client, from the UI, securely (this is currently turned off, I'm getting the dreade ECONNREFUSED)

	Server => Client
	Server <= Client
                         
The UI handles realtime (APE) connections from CloudSandra.  We open up realtime connections for today's graphs, as well as internal alerts that we post (whenever SEVERE is logged in a plugin or on the client/server)                     

	UI <= COMET (APE) <= CloudSandra
	
		
Data Model
-----------------------------------
	
There are two column families in CloudSandra.  1 has a UTF8Type comparator for self-indexing, the other has a LongType comparator for storing time-sorted data.  I delimit by day, as I can paginate if necessary

	CF1 UTF8Type
	CF2 LongType

More than 1 server is possible if load balancing comes into place

	CF1 ['servers']
		=> IP1, Date

Clients stored/upserted by the time they last came 'online'

	CF1 ['clients']
		=> IP1, Date
		=> IP2, Date 

Users for the UI are stored/upserted by the time they last came 'online'	
	
	CF1 ['users']
		=> User1, Date
		=> User2, Date 
	
Plugins stored/upserted by the time they last reported	

	CF1 ['plugins']
		=> Plugin1, Date
		=> Plugin2, Date
		
New logs will eventually be able to be added to monitoring, store by when they started being tailed

	CF1 ['IP1:logs']
		=> Log1, Date
		=> Log2, Date	

Currently EpocTime is determined by server, and JSON has date from client.  How should I manage this?		
	
Store all logs ever for this file under a key, good map/reduce use case - better would be lookup of days the log reported

	CF2 ['IP1:_path_to_log]
		=> EpocTime1, JSON
		=> EpocTime2, JSON
		
Store all plugin data in one row, good map/reduce use case - better would be lookup of days the plugin reported

	CF2 ['IP2:plugin]
		=> EpocTime1, JSON
		=> EpocTime2, JSON
			...

Store log data by day, if we need to aggregate at larger level we can run map/reduce or make a few more calls to get data

	CF2 ['IP:logs:_path_to_log_:YYYY:MM:DD]
		=> EpocTime1, JSON
		=> EpocTime2, JSON
		
Store plugin data by data, if we need to aggregate at larger level we can map/reduce or make a few more calls to get data

	CF2 ['IP:plugins:plugin:YYYY:MM:DD]
		=> EpocTime1, JSON
		=> EpocTime2, JSON
	
Store all alerts by day, this way we can view a historical record as well as listen in realtime for alerts

	CF2 ['alerts:YYYY:MM:DD]
		=> EpocTime1, JSON
		=> EpocTime2, JSON
			
Relational use cases

	CF1 ['client-tags']
		=> IP1, tag1
		=> IP2, tag2		
			
	CF1 ['client-external']
		=> IP1, external
		=> IP2, extneral
		
Pagination use case
We pull back only 1000 records at a time.
		
CQL use case	
CQL allow us to get all row keys from a CF, this could be useful for deleting crap data - not in place yet

Count use case
We keep track of live connections to server(s) at any given time as well as total connections made (I want to do logs, but I need to add that in to bulk loading still)
Counters ['connections-total']
Counters ['connections-live']

Bulk Load use case
Bulk loading allows us to not make ridiculous amounts of REST requests consecutively (the protocol can handle it, the fermata library has DNS issues sometimes, also high load CPU)
In place, but not for lookup data, runs every 2 minutes, the option to make everything realtime is there too.

Map/Reduce use case
If I want to use data sets other than a single day and counts have determined that +1 days of data sets are too large to render, we can map/reduce this - not in place yet

Errors to Fix
-----------------------------------


Features to Add
-----------------------------------

Isidorey integrations node.js everyday at X
https://api.isidorey.net/WHOSONCALL

npm

Make alerts better for SEVERE on connection issues, since chaos monkey introduces every 5 min

Automated restarts

Command and control of boxes through Twilio

Plugins need to be reformatted for new dependency model

Plugins need to check if command exists (/usr/sbin/lsof | wc -l instead of lsof)

Add command line manager for UI -> Server -> Client

Add word count, and auto indexing, for a log entry (come up with good use cases for better filtering with 100K entries) - algorithm almost there, need bulk counters in CloudSandra

Make UI portion of log information for indexes
	
Get PID of child processes and store instead of killing through a script?

Add Twilio library in for alerting

Add log-based text alerts

Write up a detailed use-case on alerting (pluses and minuses of CloudWatch vs. Twilio)

Tailing...ignore \n !

Fix initial bulk load failure check

Add multiple disks to check in plugin

Add CloudWatch metrics to instance list for ease

Make CloudSandra credentials apparent

Make a deploy/undeploy solution

Fix EC2 groups (don't match?)

Log table formatting

Need to unset realtime divs (add in call to get external IP), fix CSS

Make utils module work for UI

Add counts to bulk posting

Find a better way to integrate dependencies across the board

DAO logging

Add redundancy to post 400 status (DNS error or something)

Need to handle null alerts for today better

Hook into s3 for config files?

Use command-manager as log tailing for new files

Add ability to view/edit config files on server using management port

Implmenet TLS websockets, though I thought they were by default - http://bravenewmethod.wordpress.com/2011/02/21/node-js-tls-client-example/

Deployable? https://github.com/codeinthehole/node-multi-scp

Add better UI functionality for alerts (based on Twilio API and the CloudSandra API / CloudWatch)

Put back updated checks for handling gui requests (new log files to monitor, alerts t/f)

Add ability to monitor all logs in directory

Fix broken plugins - almost there

Add file streaming to grab remote files and check for errors?  Any other useful ideas?

Add chart configuration inside plugin

Add better module configuration

Troubleshooting
-----------------------------------

Ulimits!

Change timeToPost from 120 to 60 if you have massive and many logs being tailed


Coding on the Shoulders of Giants
-----------------------------------

https://github.com/meltingice/NodeMonitor

https://github.com/robrighter/Node-Activity-Monitor-Without-A-Websocket

https://github.com/lorenwest/node-monitor

https://github.com/makoto/node-websocket-activity-monitor

http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever

http://elegantcode.com/2011/04/12/taking-baby-steps-with-node-js-some-node-js-goodies/

http://refactormycode.com/codes/1420-node-js-calculating-total-filesize-of-3-files

https://github.com/mranney/node_redis

http://stackoverflow.com/questions/385408/get-program-execution-time-in-the-shell

http://www.neeraj.name/2010/03/30/nodejs-too-many-open-files.html

http://stackoverflow.com/questions/3877915/node-js-return-result-of-file

http://jeffkreeftmeijer.com/2010/things-i-learned-from-my-node.js-experiment/

http://www.contentwithstyle.co.uk/content/long-polling-example-with-nodejs

http://lethain.com/log-collection-server-with-node-js/

http://jeffkreeftmeijer.com/2010/experimenting-with-node-js/

https://github.com/sjwalter/node-twilio

http://blog.new-bamboo.co.uk/2009/12/7/real-time-online-activity-monitor-example-with-node-js-and-websocket

https://github.com/bigeasy/node-ec2

http://blog.jaeckel.com/2010/03/i-tried-to-find-example-on-using-node.html

http://utahjs.com/2010/09/16/nodejs-events-and-recursion-readdir/

https://github.com/joyent/node/blob/5a87bd168d8fbeca7d48b9ddaa3b4e8a9336719c/doc/api/tls.markdown

http://bravenewmethod.wordpress.com/2011/02/21/node-js-tls-client-example/

http://adlatitude.posterous.com/weekend-project-part-1-getting-nodejs-and-now
