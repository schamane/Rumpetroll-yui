YUI().add( 'ts-engine-camera',function(Y) {

var Camera = function(config) {
	Camera.superclass.constructor.apply(this, arguments);
	var date = new Date(),
	    hour = date.getHours()*60*60,
	    min = date.getMinutes()*60,
	    sek = date.getSeconds();
	this.bg =  (hour+min+sek)*360/86400;
	this.x = config.x ? config.x : 0;
	this.y = config.y ? config.y : 0;
};

Camera.NAME = "ts-engine-camera";
Camera.ATTRS = {
    cW:		{},
    cH:		{},
    context:	{},
    minZoom:	{ value: 1.3 },
    maxZoom:	{ value: 1.8 },
    zoom:	{ value: 1.3 },
    //backgroundColor: { valueFn: function() { return Math.random()*360; }},
    debug:	{ value: false }
};

Y.extend(Camera, Y.Base);

Camera.prototype.initializer = function() {
    this.on('update', this._update);
};

Camera.prototype.setupContext = function() {
	var width = this.get('cW'),
	    height = this.get('cH'),
	    zoom = this.get('zoom'),
	    x = this.x,
	    y = this.y,
	    translateX = width / 2 - x * zoom,
	    translateY = height / 2 - y * zoom,
	    context = this.get('context');
	
	// Reset transform matrix
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.fillStyle = 'hsl(' + this.bg + ',50%,10%)';
	context.fillRect(0, 0, width, height);
	
	context.translate(translateX, translateY);
	context.scale(zoom, zoom);
	
	if(this.get('debug')) {
		this.drawDebug();
	}
};

Camera.prototype._update = function(e, uX, uY, uM, umM) {
	var bg = this.bg + 0.005,
	    x = this.x,
	    y = this.y,
	    minZoom = this.get('minZoom'),
	    maxZoom = this.get('maxZoom'),
	    zoom = this.get('zoom'),
	    targetZoom = (maxZoom + (minZoom - maxZoom) * Math.min(uM, umM) / umM);
	
	bg = bg > 360 ? 0 : bg;
	
	this.set('zoom', zoom + (targetZoom - zoom) / 60);
	
	var delta = {
		x: (uX - x) / 30,
		y: (uY - y) / 30
	}
	
	if(Math.abs(delta.x) + Math.abs(delta.y) > 0.1) {
		this.x = x + delta.x;
		this.y = y + delta.y;
		this.fire('positionChanged', x, y);
		this.fire('hasDelta', delta.x, delta.y);
	}
	this.bg = bg;
};

// Gets bounds of current zoom level of current position
Camera.prototype.getBounds = function() {
	var width =  this.get('cW'),
	    height =  this.get('cH'),
	    x = this.x,
	    y = this.y,
	    zoom = this.get('zoom');
	return [
		{x: x - width / 2 / zoom, y: y - height / 2 / zoom},
		{x: x + width / 2 / zoom, y: y + height / 2 / zoom}
	];
};

// Gets bounds of minimum zoom level of current position
Camera.prototype.getOuterBounds = function() {
	var width =  this.get('cW'),
	    height =  this.get('cH'),
	    x = this.x,
	    y = this.y,
	    minZoom = this.get('minZoom');
	return [
		{x: x - width / 2 / minZoom, y: y - height / 2 / minZoom},
		{x: x + width / 2 / minZoom, y: y + height / 2 / minZoom}
	];
};

// Gets bounds of maximum zoom level of current position
Camera.prototype.getInnerBounds = function() {
	var width =  this.get('cW'),
	    height =  this.get('cH'),
	    x = this.x,
	    y = this.y,
	    maxZoom = this.get('maxZoom');
	return [
		{x: x - width / 2 / maxZoom, y: y - height / 2 / maxZoom},
		{x: x + width / 2 / maxZoom, y: y + height / 2 / maxZoom}
	];
};

Camera.prototype.startUILayer = function() {
	this.get('context').setTransform(1, 0, 0, 1, 0, 0);
};

Camera.prototype.debugBounds = function(bounds, text) {
	var context = this.get('context');
	context.strokeStyle   = '#fff';
	context.beginPath();
	context.moveTo(bounds[0].x, bounds[0].y);
	context.lineTo(bounds[0].x, bounds[1].y);
	context.lineTo(bounds[1].x, bounds[1].y);
	context.lineTo(bounds[1].x, bounds[0].y);
	context.closePath();
	context.stroke();
	context.fillText(text, bounds[0].x + 10, bounds[0].y + 10);
};

Camera.prototype.drawDebug = function() {
	this.debugBounds(this.getInnerBounds(), 'Maximum zoom camera bounds');
	this.debugBounds(this.getOuterBounds(), 'Minimum zoom camera bounds');
	this.debugBounds(this.getBounds(), 'Current zoom camera bounds');
};

Y.namespace('TS.engine').Camera = Camera;

}, '1.0', {requires: ['base']});
