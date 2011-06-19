YUI().add( 'ts-engine-arrow',function(Y) {

var Pi = Math.PI,
    Pi12 = Pi / 2;

var Arrow = function() {
	Arrow.superclass.constructor.apply(this, arguments);
	var canvas = this.get('canvas');
	this.x = 0;
	this.y = 0;
	
	this.tadpole = this.get('tadpole');
	this.camera = this.get('camera');
	
	this.angle = 0;
	this.distance = 10;
	
	this.cW = canvas._node.width/2;
	this.cH = canvas._node.height/2;
	
	this.camX = this.camera.x;
	this.camY = this.camera.y;
	this.tadPoleX = this.tadpole.x;
	this.tadPoleY = this.tadpole.y;
};

Arrow.NAME = "ts-engine-arrow";
Arrow.OPACITY = .8;
Arrow.ATTRS = {
    tadpole: {},
    camera: {},
    context: {},
    canvas: {}
};

Y.extend(Arrow, Y.Base);

Arrow.prototype._onCamUpdate = function(e, x, y) {
	this.camX = x;
	this.camY = y;
	this.angle = Math.atan2(this.tadPoleY - this.camY, this.tadPoleX - this.camX);
};

Arrow.prototype._onTadpoleMove = function(e, x, y) {
	this.tadPoleX = x;
	this.tadPoleY = y;
	this.angle = Math.atan2(this.tadPoleY - this.camY, this.tadPoleX - this.camX);
};

Arrow.prototype.update = function() {
	//this.angle = Math.atan2(this.tadpole.y - this.camY, this.tadpole.x - this.camX);
};

Arrow.prototype.draw = function() {
	var context = this.get('context'),
	    cW = this.cW,
	    cH = this.cH,
	    cameraBounds = this.camera.getBounds(),
	    angle = this.angle,
	    size = 4,
	    arrowDistance = 100,
	    tx = this.tadpole.x,
	    ty = this.tadpole.y;
	
	if( tx < cameraBounds[0].x ||
		ty < cameraBounds[0].y ||
		tx > cameraBounds[1].x ||
		ty > cameraBounds[1].y ) {
		
		var w = cW - 10,
		    h = cH - 10,
		    aa = Math.atan(h / w),
		    ss = Math.cos(angle),
		    cc = Math.sin(angle);
		if((Math.abs(angle) + aa) % Pi12 < aa) {
			arrowDistance = w / Math.abs(ss);
		} else {
			arrowDistance = h / Math.abs(cc);
		}

		var x = cW + ss * arrowDistance,
		    y = cH + cc * arrowDistance,
		    point = calcPoint(x, y, angle, 2, size),
		    side1 = calcPoint(x, y, angle, 1.5, size),
		    side2 = calcPoint(x, y, angle, 0.5, size);

		// Draw arrow
		context.fillStyle = 'rgba(155,55,255,'+Arrow.OPACITY+')';
		context.beginPath();
		context.moveTo(point.x, point.y);
		context.lineTo(side1.x, side1.y);
		context.lineTo(side2.x, side2.y)
		context.closePath();
		context.fill();
	}
};

var calcPoint = function(x, y, angle, angleMultiplier, length) {
	var c  = angle + Pi * angleMultiplier;
	return {
		x: x + Math.cos( c ) * length,
		y: y + Math.sin( c ) * length
	}
};

Y.namespace('TS.engine').Arrow = Arrow;

}, '1.0', {requires: ['base']});
