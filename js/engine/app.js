YUI().add( 'ts-engine-app',function(Y) {

var TS = Y.TS,
    engine = TS.engine,
    Model = engine.Model,
    Tadpole = engine.Tadpole,
    WaterParticle = engine.WaterParticle,
    Camera = engine.Camera,
    Keys = engine.Keys,
    IO = engine.IO,
    InputMessage = engine.InputMessage;

var App = function() {
    Y.log("app constructor", "info");
    App.superclass.constructor.apply(this, arguments);
    this.messageQuota = 5;
    this.keyNav = {x:0,y:0};
    this.keys = Keys;
    this.pause = false;

    Y.log("app constructor done", "info");
};

App.NAME = "ts-engine-app";
App.ATTRS = { 
		socket : { value: "ws://127.0.0.1:8181"} //Default development socket
};
App.SPEED = 1000/30;

Y.extend(App, Y.Widget);

App.prototype._runLoop = function() {
	if(!this.pause){
		this.model.fire('tickUpdate');
		this.model.fire('tickDraw');
	}
};

App.prototype._sendTextMessage = function(e, msg) {
	if(!this.pause) {
	var regexp = /name: ?(.+)/i;
	if(regexp.test(msg)) {
		this.setUsername(msg.match(regexp)[1]);
		return;
	}
		Y.log("App send message:"+msg);
		this.sendMessage(msg);
	}
};

App.prototype.bindUI = function() {
	var canvas = this.get('contentBox'),
	    webSocket,
	    webSocketService,
	    socket = this.get('socket');
	Y.log("bindUI", "info");
	Y.log("socket:"+socket, "info");
	
	model = new Model({canvas: canvas});
	model.arrows = {};
	this.model = model;
	webSocket		= new WebSocket( socket );
	webSocket.onopen 	= Y.bind( this.onSocketOpen, this);
	webSocket.onclose	= Y.bind( this.onSocketClose, this);
	webSocket.onmessage	= Y.bind( this.onSocketMessage, this);
		
	this.ws = webSocketService = new IO({model: model, webSocket: webSocket});
	
	model.set('IO', webSocketService);
	
	Y.on('mousemove', this.model.onMouseMove, canvas, this.model);
	Y.on('mousedown', this.mousedown, canvas, this);
	Y.on('mouseup', this.mouseup, canvas, this);
	Y.on('keydown', this.keydown, document, this);
	Y.on('keyup', this.keyup, document, this);
	Y.one('#pause').on('click', function(e) { e.preventDefault(); this.pause = !this.pause; return false; }, this );
	
	//io events
	this.ws.on('data', model._onData, model );
	
	//init chat input
	var chat = new InputMessage({contentBox: '#chat'});
	chat.after('send-message', this._sendTextMessage, this);
};

App.prototype.renderUI = function() {
	var self = this;
	Y.log("render - start loop");
	this.timer = Y.later(App.SPEED, this, this._runLoop, null, true);
	Y.log("render - start loop done");
};

App.prototype.onSocketOpen = function(e) {
	//console.log('Socket opened!', e);
	
	//FIXIT: Proof of concept. refactor!
	return;
	uri = parseUri(document.location)
	if ( uri.queryKey.oauth_token ) {
		this.authorize(uri.queryKey.oauth_token, uri.queryKey.oauth_verifier);
	}
	// end of proof of concept code.
};

App.prototype.onSocketClose = function(e) {
	//console.log('Socket closed!', e);
	this.ws.connectionClosed();
};

App.prototype.onSocketMessage = function(e) {
	try {
	    var data = Y.JSON.parse(e.data);
	    this.ws.processMessage(data);
	} catch(e) {}
};

App.prototype.sendMessage = function(msg) {
	if (this.messageQuota>0) {
	    this.messageQuota--;
	    this.ws.sendMessage(msg);
	}
};

App.prototype.authorize = function(token,verifier) {
	this.ws.authorize(token,verifier);
};

App.prototype.mousedown = function(e) {
	this.model.fire('mousedown', e);
	if(e.which == 1)
		this.model.fire('moveme');
	/*
	var mouse = this.model.mouse,
	    tadpole = mouse.tadpole,
	    userTadpole = this.model.userTadpole;
	mouse.clicking = true;

	if(tadpole && tadpole.get('hover') && tadpole.onclick(e)) {
	    return;
	}
	*/
};

App.prototype.mouseup = function(e) {
	if(e.which == 1)
		this.model.fire('stopme');
};

App.prototype.keydown = function(e) {
	var model = this.model,
	    keys = this.keys,
	    userTadpole = model.userTadpole,
	    keyCode = e.keyCode;
	if(keyCode == keys.up) {
		this.model.keyNav.y = -1;
	}
	else if(keyCode == keys.down) {
		this.model.keyNav.y = 1;
	}
	else if(keyCode == keys.left) {
		this.model.keyNav.x = -1;
	}
	else if(keyCode == keys.right) {
		this.model.keyNav.x = 1;
	} else {
	    return;
	}
	userTadpole.setMaxMomentum();
	e.preventDefault();
};

App.prototype.keyup = function(e) {
	var keys = this.keys,
	    userTadpole = model.userTadpole;
	if(e.keyCode == keys.up || e.keyCode == keys.down) {
		this.model.keyNav.y = 0;
		if(this.model.keyNav.x == 0 && this.model.keyNav.y == 0) {
			userTadpole.stop();
		}
		e.preventDefault();
	}
	else if(e.keyCode == keys.left || e.keyCode == keys.right) {
		this.model.keyNav.x = 0;
		if(this.model.keyNav.x == 0 && this.model.keyNav.y == 0) {
			userTadpole.stop();
		}
		e.preventDefault();
	}
};

App.prototype.resize = function(e) {
	this.resizeCanvas();
};

App.prototype.setUsername = function( name ) {
    this.model.userTadpole.set('name', name);
    Y.log("set name to :" + name);
};

Y.namespace("TS.engine").App = App;

}, '1.0', {requires: ['json', 'node', 'widget', 'ts-engine-model', 'ts-engine-tadpole', 'ts-engine-water', 'ts-engine-keys', 'ts-engine-inputmessage', 'ts-engine-io', 'dump']});
