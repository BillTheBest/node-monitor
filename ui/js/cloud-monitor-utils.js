Array.prototype.max = function() {
	var max = this[0];
	var len = this.length;
	for (var i = 1; i < len; i++) if (this[i] > max) max = this[i];
	return max;
}

Array.prototype.min = function() {
	var min = this[0];
	var len = this.length;
	for (var i = 1; i < len; i++) if (this[i] < min) min = this[i];
	return min;
}

if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

function toJSON(type, request, data, subRequest) {
	console.log('');
	console.log('Formatting JSON Request');
	console.log('Type: ' + type);
	console.log('Request: ' + request);
	console.log('Data: ' + data);
	console.log('SubRequest: ' + subRequest);
	console.log('');
	
	var broadcastData = JSON.stringify({
		'type': type, 
		'request': request,
		'data': data,
		'subRequest': subRequest
	});
 	return broadcastData;
}

function fromJSON(jsonMessage) {
	var jsonObject;
	
	try {
		jsonObject = JSON.parse(jsonMessage);
	} catch (SyntaxError) {
		console.log('Some JSON element was undefined, there was a syntax error');
	}
	
	return jsonObject;
}


function validateJSON(jsonMessage) {
	var jsonObject;
	
	try {
		jsonObject = JSON.parse(jsonMessage);
		return true;
	} catch (SyntaxError) {
		console.log('Some JSON element was undefined, there was a syntax error');
		return false;
	}
	
	return false;
}

function formatPluginKey(plugin, time) {
	var date = new Date(time);
	var key = ip + ':' + PLUGINS + ':' + plugin + ':' + date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();
	return key;
}

function formatLookupPluginKey() {
	var key = ip + ':' + PLUGINS;
	return key;
}

function formatLogKey(log, time) {
	var date = new Date(time);
	var key = ip + ':' + LOGS + ':' + log + ':' + date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();
	return key;
}

function formatLookupLogKey() {
	var key = ip + ':' + LOGS;
	return key;
}

function trim(data) {
	data = data.replace(/^\s+/, '');
	for (var i = data.length - 1; i >= 0; i--) {
		if (/\S/.test(data.charAt(i))) {
			data = data.substring(0, i + 1);
			break;
		}
	}
	return data;
};

function isEven(number) {
    return (number%2 == 0) ? true : false;
};


function safeEncode(key) {
	var encodedKey = key.replace(/\//g, '_');
	return encodedKey;
}

function checkDateForToday(dateToCheck) {
	var days = 0;
	var difference = 0;
	var today = new Date().getTime();
	difference = dateToCheck - today;
	days = Math.round(difference/(1000 * 60 * 60 * 24));
	return days;
}

function refreshDataTable() {
	$('.datatable').dataTable();
}

function getUserId() {
	var url = 'https://graph.facebook.com/franklovecchio?callback=?';
	$.getJSON(url, function(json) {
		$.each(json.data, function(i, fb) {
			console.log('getting data ' + fb);
			console.log(fb.message);
		});
	});
}

/**
* scrollbar onclick
*/
function findPosX(obj) {
		var currleft = 0;
		if (obj.offsetParent)
			while (obj.offsetParent) {
				currleft += obj.offsetLeft
				obj = obj.offsetParent;
			}
		else if (obj.x) currleft += obj.x;
		return currleft;
	}
	
	function findPosY(obj) {
		var currtop = 0;
		if (obj.offsetParent)
			while (obj.offsetParent) {
				currtop += obj.offsetTop
				obj = obj.offsetParent;
			}
		else if (obj.y) currtop += obj.y;
		return currtop;
	}

function init(){ 
	
	// Scrollbar width
	dScroll = 17;
		
	document.getElementById("realtime-logs").onmousedown = function(event){
		console.log(findPosX(this)+" - "+findPosY(this));	
		x2 = findPosX(this) + this.offsetWidth; x1 = x2 - dScroll;
		
		if( x1 < event.clientX && x2 > event.clientX ) stopLogs(this);
	
	}
	
	document.getElementById("realtime-logs").onmouseup = function(event){
		showLogs(this); 
	}
	
	
	document.getElementById("realtime-clients").onmousedown = function(event){
		console.log(findPosX(this)+" - "+findPosY(this));	
		x2 = findPosX(this) + this.offsetWidth; x1 = x2 - dScroll;
		
		if( x1 < event.clientX && x2 > event.clientX ) stopMessages(this);
	
	}
	
	document.getElementById("realtime-clients").onmouseup = function(event){
		showMessages(this); 
	}
}


// here is function that we attach to events

function stopMessages(e) {
	appendMessages = false;
}

function stopLogs(e) {
	appendLogs = false;
}

function showMessages(e) {
	//appendMessages = true;
}

function showLogs(e) {
	//appendLogs = true;
}

function stopStartMessages() {
	if (appendMessages) {
		appendMessages = false;
	} else {
		appendMessages = true;
	}
}

function stopStartLogs() {
	if (appendLogs) {
		appendLogs = false;
	} else {
		appendLogs = true;
	}
}

try {
	window.addEventListener('load', init, false);
} catch(e) {
	window.onload = init;
}