YUI().add( 'ts-engine-model',function(Y) {

var TS = Y.TS,
    engine = TS.engine,
    Tadpole = engine.Tadpole,
    WaterParticle = engine.WaterParticle,
    Camera = engine.Camera,
    Message = engine.Message;

var Model = function() {
	this.tadpoles = [];
	this.userTadpole;
	this.camera;
	this.mouse = {x: 0, y: 0, worldx: 0, worldy: 0, tadpole: null};
	this.keyNav = { x: 0, y: 0 };
	this.settings;
	this.messageQuota = 5;
	Model.superclass.constructor.apply(this, arguments);
};

Model.NAME = "ts-engine-model";
Model.ATTRS = {
    context: { valueFn: function() {
			return  this.get('canvas')._node.getContext('2d');
		}},
    canvas: {},
    offset: { valueFn: function() {
			return this.get('canvas').getXY();
		}},
    IO: {}
};
Y.extend( Model, Y.Base );

Model.prototype.initializer = function() {
	var context = this.get('context'),
	    canvas = this.get('canvas'),
	    i;
	
	this._resizeCanvas();
	
	this.userTadpole = new Tadpole({ context: context });
	this.tadpoles[this.userTadpole.get('id')] = this.userTadpole;
	
	this.waterParticles = [];
	for(i = 0; i < 150; i++) {
		this.waterParticles[i] = new WaterParticle({ context: context });
	}
	
	//Y.log(this.userTadpole.x+':'+ this.userTadpole.y);
	this.camera = new Camera({
		cW: canvas._node.width,
		cH: canvas._node.height,
		context: context,
		x: this.userTadpole.x,
		y: this.userTadpole.y
	});
	//this.camera.x = this.userTadpole.x;
	//this.camera.y = this.userTadpole.y;
	
	this.arrows = {};
	
	//this.on('tick', this._tick);
	this.on('tickUpdate', this._update);
	this.on('tickDraw', this._draw);
	this.on('stopme', this.userTadpole.stop, this.userTadpole);
	this.on('moveme', this.userTadpole.setMaxMomentum, this.userTadpole);
	
	//deps:
	this.camera.on('hasDelta', this._onWaterMove, this);
	
	//io events:
	//this.ws.on('welcome', this._onWelcome, this);
	Y.log("Model initialized", "info");
};

Model.prototype.onMouseMove = function(e) {
	var offset = this.get('offset');
	this.mouse.x = e.pageX - offset[0];
	this.mouse.y = e.pageY - offset[1];
};

Model.prototype._tick = function() {
    //Y.log("update", "info");
    this._update();
    this._draw();
};

Model.prototype._update = function() {
	// Update usertadpole
	var keyNav = this.keyNav,
	    mouse = this.mouse,
	    camera = this.camera,
	    userTadpole = this.userTadpole,
	    offset = this.get('offset'),
	    i, length = this.tadpoles.length,
	    wlength = this.waterParticles.length,
	    outerBounds, cameraBounds,
	    webSocketService = this.get('IO');
	
	if (this.messageQuota < 5 && userTadpole.get('age') % 50 == 0) { this.messageQuota++; }
	
	if(keyNav.x != 0 || keyNav.y != 0) {
		userTadpole.userUpdate(userTadpole.x + keyNav.x,userTadpole.y + keyNav.y);
	}
	else {
		var mvp = this._getMouseWorldPosition();
		mouse.worldx = mvp.x; // - offset[0];
		mouse.worldy = mvp.y; // - offset[1];
		userTadpole.userUpdate( mouse.worldx, mouse.worldy);
	}
	
	if(userTadpole.get('age') % 6 == 0 && userTadpole.get('changed') > 1 && webSocketService.hasConnection) {
	//if(userTadpole.get('age') % 6 == 0 && userTadpole.get('changed') > 1) {
		userTadpole.set('changed', 0);
		webSocketService.sendUpdate(userTadpole);
		//Y.log("send update");
	}
	
	camera.fire('update', userTadpole.x, userTadpole.y, userTadpole.get('momentum'), userTadpole.get('maxMomentum'));
	
	// Update tadpoles
	for(i in this.tadpoles) {
		//if( this.tadpoles[i] && this.tadpoles[i].update)
		this.tadpoles[i].update(mouse);
	}
	
	
	// Update waterParticles
	outerBounds = camera.getOuterBounds();
	for(i = 0; i < wlength; i++) {
		//this.waterParticles[i].fire('update', outerBounds);
		this.waterParticles[i]._update(outerBounds);
	}
	
	// Update arrows
	//cameraBounds = camera.getBounds();
	for(i in this.arrows) {
		this.arrows[i].update();
	}
};

Model.prototype._draw = function() {
	var i,
	    particles = this.waterParticles,
	    wlength = particles.length,
	    tlength = this.tadpoles.length;
	this.camera.setupContext();
	
	// Draw waterParticles
	for(i = 0; i < wlength; i++) {
	    //this.waterParticles[i].fire('draw');
	    particles[i]._draw();
	}
	
	// Draw tadpoles
	//for(i = -1; i < tlength; i++) {
	for(i in this.tadpoles) {
		if(this.tadpoles[i] && this.tadpoles[i].draw)
		this.tadpoles[i].draw();
	}
	
	// Start UI layer (reset transform matrix)
	this.camera.startUILayer();
	
	// Draw arrows
	for(i in this.arrows) {
		this.arrows[i].draw();
	}
};

Model.prototype._getMouseWorldPosition = function() {
	var mouse = this.mouse,
	    camera = this.camera,
	    canvas = this.get('canvas'),
	    width = canvas.get('width'),
	    height = canvas.get('height'),
	    camX = camera.x,
	    camY = camera.y,
	    camZoom = camera.get('zoom');
	return {
		x: (mouse.x + (camX * camZoom - width / 2)) / camZoom,
		y: (mouse.y + (camY * camZoom  - height / 2)) / camZoom
	}
};


Model.prototype._resizeCanvas = function() {
	var canvas = this.get('canvas');
	canvas.set('width',  window.innerWidth - 60);
	canvas.set('height', "500");
};

/* TODO: maybe we need waterController */
Model.prototype._onWaterMove = function(e, deltax, deltay) {
	var i,
	    particles = this.waterParticles,
	    wlength = particles.length;
	for(i = 0; i < wlength; i++) {
		particles[i]._updateWater(deltax, deltay);
	}
};

Model.prototype._onData = function( e ){
	var data = e.data,
	    type = e.type,
	    fn = this['_on'+type.charAt(0).toUpperCase() + type.slice(1)];
	
	//Y.log("Type="+type);
	
	if (fn)
	    fn.call(this, data);
};

Model.prototype._onWelcome = function(data) {
	var id = data.id;
	if(!id)
	    return;
	this.userTadpole.id = id;
	this.tadpoles[id] = this.tadpoles[-1];
	delete this.tadpoles[-1];
	//this.tadpoles[-1] = null;
	this.userTadpole.set('name', this.userTadpole.get('name') +' ' + id);
	Y.log("initialize self "+ Y.dump(data));
	var webSocketService = this.get('IO');
	webSocketService.hasConnection = true;

};

Model.prototype._onUpdate = function(data) {
	var newtp = false,
	    context = this.get('context')
	    id = data.id;
	
	//delete e.data;
	
	//Y.log("data:"+Y.dump(data), "info", "updateHandler");
	//Y.log("data:"+Y.dump(this.tadpoles), "info", "updateHandler");
	if(!this.tadpoles[id]) {
		Y.log("create: "+ id +" !!!", "info");
		newtp = new Tadpole({ context: context });
		this.tadpoles[id] = newtp;
		this.arrows[id] = new Arrow({tadpole: newtp, camera: this.camera, context: context, canvas: this.get('canvas') });
		//subscribe cam change
		this.camera.on('positionChanged', this.arrows[id]._onCamUpdate, this.arrows[id] );
		Y.log("create new tadpole", "info");
	}
	
	var tadpole = this.tadpoles[id];
	
	tadpole.set('name', data.name);
	//Y.log("set tadpole "+id+"name:"+ data.name, "info");
	
	if(id == this.userTadpole.id) {
		return;
	}
	
	if(newtp) {
		tadpole.x = data.x;
		tadpole.y = data.y;
	} else {
		tadpole.set('targetX', data.x);
		tadpole.set('targetY', data.y);
	}
	
	tadpole.set('angle', data.angle);
	tadpole.set('momentum', data.momentum);
	
	tadpole.set('timeSinceLastServerUpdate', 0);
};

Model.prototype._onMessage = function(data) {
	//Y.log(Y.dump(data));
	var id = data.id,
	    message = data.message,
	    tadpole = this.tadpoles[id] ? this.tadpoles[id] : null,
	    messages = tadpole ? tadpole.get('messages') : [];
	//Y.log(Y.dump(tadpole));
	if(messages) {
		messages.push(new Message({message: message}));
		if(tadpole)
			tadpole.set('messages', messages);
		Y.log("set message for "+data.id + " - "+data.message);
	}
};

Model.prototype._onClosed = function(data) {
	Y.log("closed" + Y.dump(data));
	var id = data.id,
	    userId = this.userTadpole.id;
	this.tadpoles[id].destroy();
	delete this.tadpoles[id];
	if(id == userId) {
	    var webSocketService = this.get('IO');
	    webSocketService.hasConnection = false;
	    Y.log("close own connection "+id);
	};
	Y.log("removed tadpole "+id);
};

Y.namespace('TS.engine').Model = Model;

}, '1.0', {requires: ['base', 'ts-engine-tadpole', 'ts-engine-camera', 'ts-engine-water', 'ts-engine-arrow', 'ts-engine-message']});