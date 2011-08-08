/**
 * top.js - plugin
 */
 
var fs = require('fs');

var modules = {
	
	daoManager: 'dao-manager',
	loggingManager: 'logging-manager'
	
};
  
var Plugin = {

	name: 'top',
	command: ''
		
};

Plugin.format = function (data) {

	var system = Plugin.utilities.getSystemEnvironment();
 	
 	switch (system) {
 		case 'darwin':
 			return Plugin.formatDarwin(data);
 			break;
 		case 'linux2':
 			return Plugin.formatLinux2(data);
 			break;
 		default:
 			Plugin.logger.write(Plugin.constants.levels.INFO, 'Unaccounted for system: ' + system);
 			return undefined;
 			break;
 	}
 	
};

Plugin.formatLinux2 = function (data) {
	
	var splitBuffer = [];
	splitBuffer = data.split('\n');

	/*
	top - 22:32:04 up 103 days,  2:52,  1 user,  load average: 0.40, 0.57, 0.28
	Tasks:  82 total,   1 running,  81 sleeping,   0 stopped,   0 zombie
	Cpu(s):  2.3%us,  1.2%sy,  0.0%ni, 92.1%id,  0.2%wa,  0.0%hi,  0.0%si,  4.1%st
	Mem:   1705708k total,  1304804k used,   400904k free,    57052k buffers
	Swap:   917500k total,     6088k used,   911412k free,  1008452k cached
	*/
};

Plugin.formatDarwin = function (data) {

	var splitBuffer = [];
	splitBuffer = data.split('\n');
	
	/**
	* Helps visualize WTF is going on
	*/
	var processes = {
		total: '',
		running: '',
		stuck: '',
		sleeping: '',
		threads: ''
	}
	
	var load = {
		one: '',
		five: '',
		fifteen: ''
	}
	
	var cpu = {
		user: '',
		sys: '',
		idle: ''
	}
	
	var libs = {
		resident: '',
		data: '',
		linkedit: ''
	}
	
	var regions = {
		total: '',
		resident: '',
		private: '',
		shared: ''
	}
	
	var mem = {
		wired: '',
		active: '',
		inactive: '',
		used: '',
		free: ''
	}
	
	var vm = {
		vsize: '',
		framework_vsize: '',
		pageins: '',
		pageouts: ''
	}
	
	var network = {
		packets: '',
		packets_in: '',
		packets_out: ''
	}
	
	var disks = {
		read: '',
		written: ''
	}
		
	for (i = 0; i < splitBuffer.length; i++) {
		var line = splitBuffer[i];
		var lineArray = line.split(/\s+/);
		
		var count = 0;
		switch (i) {
			case 0:
				lineArray.forEach(
					function (segment) {
						switch (count) {
							case 0:
								//Processes: 134 total, 5 running, 2 stuck, 127 sleeping, 554 threads 
								break;
							case 1:
								processes['total'] = segment;								
								break;
							case 2:
								//total
								break;
							case 3:
								processes['running'] = segment;
								
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: RunningProcesses');
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: Count');
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: ' + segment);
										
								Plugin.dao.postCloudwatch('RunningProcesses', 'Count', segment);
								
								break;
							case 4:
								// running
								break;
							case 5:
								processes['stuck'] = segment;
								
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: StuckProcesses');
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: Count');
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: ' + segment);
										
								Plugin.dao.postCloudwatch('StuckProcesses', 'Count', segment);
								
								break;
							case 6:
								//stuck
								break;
							case 7:
								processes['sleeping'] = segment;
								break;
							case 8:
								//sleeping
								break;
							case 9:
								processes['threads'] = segment;
								break;
						}
						count++;
					}
				);
				break;
			case 2: 			
				lineArray.forEach(
					function (segment) {
						switch (count) {
							case 0:
								//Load Avg: 0.63, 0.79, 0.81
								break;
							case 1:
								//Avg:
								break;
							case 2:
								load['one'] = segment.replace(',', '');
								break;
							case 3:
								load['five'] = segment.replace(',', '');
								break;
							case 4:
								load['fifteen'] = segment.replace(',', '');
								break;
						}
						count++;
					}
				);
				break;
			case 3: 
				lineArray.forEach(
					function (segment) {
						switch (count) {
							case 0:
								//CPU usage: 25.0% user, 70.0% sys, 5.0% idle 
								break;
							case 1:
								//usage:
								break;
							case 2:
								cpu['user'] = segment.replace('%', '');
								break;
							case 3:
								//user,
								break;
							case 4:
								cpu['sys'] = segment.replace('&', '');
								
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: CPU');
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: Percent');
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: ' + segment.replace('%', ''));
										
								Plugin.dao.postCloudwatch('CPU', 'Percent', segment);
								
								break;
							case 5:
								//sys,
								break;
							case 6:
								cpu['idle'] = segment.replace('%', '');
								break;
						}
						count++;
					}
				);
				break;
			case 4: 
				lineArray.forEach(
					function (segment) {
						switch (count) {
							case 0:
								//SharedLibs: 100M resident, 0B data, 20M linkedit.
								break;
							case 1:
								libs['resident'] = segment.replace('M', '');
								break;
							case 2:	
								//resident,
								break;
							case 3:
								libs['data'] = segment.replace('B', '');
								break;
							case 4:
								//data,
								break;
							case 5:
								libs['linkedit'] = segment.replace('M', '');
								break;
						}
						count++;
					}
				);
				break;
			case 5: 
				lineArray.forEach(
					function (segment) {
						switch (count) {
							case 0:
								//MemRegions: 18655 total, 1095M resident, 60M private, 363M shared.
								break;
							case 1:
								regions['total'] = segment;
								break;
							case 2:	
								//total,
								break;
							case 3:
								regions['resident'] = segment.replace('M', '');
								break;
							case 4:
								//resident,
								break;
							case 5:
								regions['private'] = segment.replace('M', '');
								break;
							case 6:
								//private,
								break;
							case 7:
								regions['shared'] = segment.replace('M', '');
								break;
						}
						count++;
					}
				);
				break;
			case 6: 
				lineArray.forEach(
					function (segment) {
						switch (count) {
							case 0:
								//PhysMem: 949M wired, 1596M active, 274M inactive, 2820M used, 5370M free.
								break;
							case 1:
								mem['wired'] = segment.replace('M', '');
								break;
							case 2:	
								//wired,
								break;
							case 3:
								mem['active'] = segment.replace('M', '');
								break;
							case 4:
								//active,
								break;
							case 5:
								mem['inactive'] = segment.replace('M', '');
								break;
							case 6:
								//inactive,
								break;
							case 7:
								mem['used'] = segment.replace('M', '');
								break;
							case 8:
								//used,
								break;
							case 9:
								mem['free'] = segment.replace('M', '');
								
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: TopFreeMemory');
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: Megabytes');
								Plugin.logger.write(Plugin.constants.levels.INFO, 'Cloudwatch param: ' + segment.replace('M', ''));
										
								Plugin.dao.postCloudwatch('TopFreeMemory', 'Megabytes', segment.replace('M', ''));
								
								break;
						}
						count++;
					}
				);
				break;
			case 7: 
				lineArray.forEach(
					function (segment) {
						switch (count) {
							case 0:
								//VM: 306G vsize, 1336M framework vsize, 280582(0) pageins, 0(0) pageouts.
								break;
							case 1:
								vm['vsize'] = segment.replace('G', '');
								break;
							case 2:	
								//vsize,
								break;
							case 3:
								vm['framework_vsize'] = segment.replace('M', '');
								break;
							case 4:
								//framework
								break;
							case 5:
								//vsize,
								break;
							case 6:
								vm['pageins'] = segment;
								break;
							case 7:
								//pageins
								break;
							case 8:
								vm['pageouts'] = segment;
								break;
						}
						count++;
					}
				);
				break;
			case 8: 
				lineArray.forEach(
					function (segment) {
						switch (count) {
							case 0:
								//Networks: packets: 80788/42M in, 32897/6320K out.
								break;
							case 1:
								//packets:
								break;
							case 2:
								network['in'] = segment;
								break;
							case 3:
								//in
								break;
							case 4:
								network['out'] = segment;
								break;
						}
						count++;
					}
				);
				break;
			case 9: 
				lineArray.forEach(
					function (segment) {
						switch (count) {
							case 0:
								//Disks: 72101/1077M read, 31030/1448M written.								
								break;
							case 1:
								disks['read'] = segment;
								break;
							case 2:
								//read,
								break;
							case 3:
								disks['written'] = segment;
								break;
						}
						count++;
					}
				);
				break;			
		}
	}
	
	var data = {

	};
	
	data['processes'] = processes;
	data['load'] = load;
	data['cpu'] = cpu;
	data['libs'] = libs;
	data['regions'] = regions;
	data['mem'] = mem;
	data['vm'] = vm;
	data['network'] = network;
	data['disks'] = disks;

	return JSON.stringify(data);
		
}

this.name = Plugin.name;

Plugin.evaluateDeps = function (childDeps, self) {

	try {
  		process.chdir(process.env['moduleDirectory']);
	} catch (Exception) {
  		
  	}
	
	for (var name in modules) {
		eval('var ' + name + ' = require(\'' + modules[name] + '\')');
	}
	
	for (var name in childDeps) {
		eval('var ' + name + ' = require(\'' + childDeps[name] + '\')');
	}
	
	var utilities = new utilitiesManager.UtilitiesManagerModule(childDeps);
	var constants = new constantsManager.ConstantsManagerModule();
	var logger = new loggingManager.LoggingManagerModule(childDeps);
	var dao = new daoManager.DaoManagerModule(childDeps);

	self = this;
	
	self.constants = constants;
	self.utilities = utilities;
	self.constants = constants;
	self.dao = dao;
	self.logger = logger;
		
};

this.name = Plugin.name;

this.poll = function (childDeps, callback) {

Plugin.evaluateDeps(childDeps, this);
	
	var key = Plugin.utilities.formatPluginKey(process.env['clientIP'], Plugin.name);
	
	/**
	* Take into account different systems
 	*/
 	var system = Plugin.utilities.getSystemEnvironment();
 	Plugin.logger.write(Plugin.constants.levels.INFO, 'System type: ' + system);
 	
 	switch (system) {
 		case 'darwin':
 			Plugin.command = 'top -l 1';
 			break;
 		case 'linux2':
 			Plugin.command = 'top -b -n 1';
 			break;
 		default:
 			Plugin.logger.write(Plugin.constants.levels.INFO, 'Unaccounted for system: ' + system);
 			break;
 	}
	
	Plugin.logger.write(Plugin.constants.levels.INFO, 'Plugin command to run: ' + Plugin.command);

	var exec = require('child_process').exec, child;
	child = exec(Plugin.command, function (error, stdout, stderr) {		
		
		var data = Plugin.format(stdout.toString());
		
		Plugin.logger.write(Plugin.constants.levels.INFO, 'TOP RETURNED: ' + data);
		
		callback(Plugin.name, key, data);
		
	});
	
};
