var mConfig = {};



//appMessageQueue from Neal
//https://github.com/Neal/Ultra/blob/master/src/js/src/appmessagequeue.js
var appMessageQueue = {
	queue: [],
	numTries: 0,
	maxTries: 5,
	working: false,
	clear: function() {
		this.queue = [];
		this.working = false;
	},
	isEmpty: function() {
		return this.queue.length === 0;
	},
	nextMessage: function() {
		return this.isEmpty() ? {} : this.queue[0];
	},
	send: function(message) {
		if (message) this.queue.push(message);
		if (this.working) return;
		if (this.queue.length > 0) {
			this.working = true;
			var ack = function() {
				appMessageQueue.numTries = 0;
				appMessageQueue.queue.shift();
				appMessageQueue.working = false;
				appMessageQueue.send();
			};
			var nack = function() {
				appMessageQueue.numTries++;
				appMessageQueue.working = false;
				appMessageQueue.send();
			};
			if (this.numTries >= this.maxTries) {
				//console.log('Failed sending AppMessage: ' + JSON.stringify(this.nextMessage()));
				ack();
			}
			//console.log('Sending AppMessage: ' + JSON.stringify(this.nextMessage()));
			Pebble.sendAppMessage(this.nextMessage(), ack, nack);
		}
	}
};


function getItems(command) {
	var xhr = new XMLHttpRequest();
	var url;

	if(mConfig.server===''){
		Pebble.showSimpleNotificationOnPebble('ControlR ErroR', 'Configuration error. You haven\'t told me what I\'m controlling.');
		return;
	}
	
	url = mConfig.server + command;

	xhr.open('GET', url, true);
	xhr.timeout = 20000;
	xhr.onload = function(e) {
		if (xhr.readyState == 4) {
			
			if (xhr.status == 200) {
				//console.log('HTTP OK');
			}
				
		}
	};
	
	xhr.ontimeout = function() {
		//console.log('HTTP request timed out');
		//Pebble.showSimpleNotificationOnPebble('ControlR ErroR', 'Timeout error. Are you running the companion app?');
		
	};
	xhr.onerror = function() {
		//console.log('HTTP request return error');
		//Pebble.showSimpleNotificationOnPebble('ControlR ErroR', 'Error error. Something didn\'t like something.');
	};
	xhr.send(null);

}

function saveLocalData(config) {
  localStorage.setItem("ip_address", config.ip_address);  
  loadLocalData();
}

function loadLocalData() {
	mConfig.ip_address = localStorage.getItem("ip_address");
	mConfig.configureUrl = "http://www.mirz.com/ControlR/index.html";
	if(mConfig.ip_address !== '') {
		mConfig.server = 'http://' + mConfig.ip_address + ':1337/api/values/';
	}
	console.log('ip: ' + mConfig.ip_address);
	console.log('server: ' + mConfig.server);
}


Pebble.addEventListener("showConfiguration", function(e) {
	Pebble.openURL(mConfig.configureUrl);
});

Pebble.addEventListener("webviewclosed",
  function(e) {
    if (e.response) {
      var config = JSON.parse(e.response);
			console.log(config);
      saveLocalData(config);
    }
  }
);

Pebble.addEventListener('ready', function(e) {
	loadLocalData();
});

Pebble.addEventListener('appmessage', function(e) {
	getItems(e.payload.command);
});