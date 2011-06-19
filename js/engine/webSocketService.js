YUI().add( 'ts-engine-io',function(Y) {

var TS = Y.TS,
    engine = TS.engine,
    Tadpole = engine.Tadpole,
    Arrow = engine.Arrow;

var WebSocketService = function() {
	WebSocketService.superclass.constructor.apply(this, arguments);
	this.model = this.get('model');
	this.webSocket = this.get('webSocket');
	this.hasConnection = false;
};

WebSocketService.NAME = "ts-engine-io";
WebSocketService.ATTRS = {
    webSocket : {},
    model: {}
};

Y.extend( WebSocketService, Y.Base );

/*
WebSocketService.prototype.welcomeHandler = function(data) {
	this.hasConnection = true;
	this.fire('welcome', data.id);
	//$('#chat').initChat();
};


WebSocketService.prototype.messageHandler = function(data) {
	this.fire('message',
	var model = this.model,
	    tadpole = model.tadpoles[data.id];
	if(!tadpole) {
		return;
	}
	tadpole.set('timeSinceLastServerUpdate', 0);
	//tadpole.messages.push(new Message(data.message));
};

WebSocketService.prototype.closedHandler = function(data) {
	var model = this.model;
	
	if(model.tadpoles[data.id]) {
		delete model.tadpoles[data.id];
		delete model.arrows[data.id];
	}
};

WebSocketService.prototype.redirectHandler = function(data) {
	if (data.url) {
		if (authWindow) {
			authWindow.document.location = data.url;
		} else {
			document.location = data.url;
		}
	}
};
*/

WebSocketService.prototype.processMessage = function(data) {
	var type = data.type;
	/*
	if( type == "welcome" ) {
		this.hasConnection = true;
	} else if( type == "closed" ) {
		this.hasConnection = false;
	}
	*/
	this.fire('data', {data: data, type: type});
};

WebSocketService.prototype.connectionClosed = function() {
	this.hasConnection = false;
	//$('#cant-connect').fadeIn(300);
};

WebSocketService.prototype.sendUpdate = function(tadpole) {
	var sendObj = {
		type: 'update',
		x: tadpole.x.toFixed(1),
		y: tadpole.y.toFixed(1),
		angle: tadpole.get('angle').toFixed(3),
		momentum: tadpole.get('momentum').toFixed(3)
	};
	
	if(tadpole.get('name')) {
		sendObj['name'] = tadpole.get('name');
	}
	
	this.webSocket.send(JSON.stringify(sendObj));
};

WebSocketService.prototype.sendMessage = function(msg) {
	var model = this.model,
	    regexp = /name: ?(.+)/i;
	if(regexp.test(msg)) {
		model.userTadpole.name = msg.match(regexp)[1];
		return;
	}
	
	var sendObj = {
		type: 'message',
		message: msg
	};
	
	this.webSocket.send(JSON.stringify(sendObj));
};

WebSocketService.prototype.authorize = function(token,verifier) {
	var sendObj = {
		type: 'authorize',
		token: token,
		verifier: verifier
	};
	
	this.webSocket.send(JSON.stringify(sendObj));
};

Y.namespace('TS.engine').IO = WebSocketService;

}, '1.0', {requires: ['base', 'ts-engine-tadpole', 'ts-engine-arrow']});
