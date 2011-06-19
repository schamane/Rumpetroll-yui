YUI().add( 'ts-engine-arrow',function(Y) {

var Pi = Math.PI,
    Pi12 = Pi / 2;

var Arrow = function() {
	Y.log("arrow constructor");
	Arrow.superclass.constructor.apply(this, arguments);
};

Arrow.NAME = "ts-engine-arrow";
Arrow.NS = "arrow";
Arrow.OPACITY = .8;
Arrow.DISTANCE = 100;
Arrow.PADDING = 10;
Arrow.SIZE = 4;
Arrow.ATTRS = {
    camera: {},
    context: {},
    canvas: {},
    canvasNode: {}
};

Y.extend(Arrow, Y.Plugin.Base);

Arrow.prototype._onCamUpdate = function(e, x, y) {
	var tadpole = this.get('host');
	this.angle = Math.atan2(tadpole.y - y, tadpole.x - x);
};

Arrow.prototype._onTadpoleMove = function(e, x, y) {
	var camera = this.get('camera');
	this.angle = Math.atan2(y - camera.x, x - camera.x);
};

Arrow.prototype.initializer = function() {
	var canvas = this.get('canvas');
	this.set('canvasNode', canvas._node);
	this.x = 0;
	this.y = 0;
	
	this.angle = 0;
	
	//subscribe tadpole move
	this.afterHostEvent('move', this._onTadpoleMove, this );
	this.afterHostMethod('draw', this.draw, this);
	this.get('camera').on('positionChanged', this._onCamUpdate, this );
};

Arrow.prototype.draw = function() {
	var tadpole = this.get('host'),
		context = tadpole.get('context'),
		canvasNode = this.get('canvasNode'),
	    cW = canvasNode.width/2,
	    cH = canvasNode.height/2,
	    cameraBounds = this.get('camera').getBounds(),
	    angle = this.angle,
	    size = Arrow.SIZE,
	    arrowDistance = Arrow.DISTANCE,
	    tx = tadpole.x,
	    ty = tadpole.y;
	
	if( tx < cameraBounds[0].x ||
		ty < cameraBounds[0].y ||
		tx > cameraBounds[1].x ||
		ty > cameraBounds[1].y ) {
		
		var w = cW - Arrow.PADDING,
		    h = cH - Arrow.PADDING,
		    aa = Math.atan(h / w),
		    ss = Math.cos(angle),
		    cc = Math.sin(angle);
		if((Math.abs(angle) + aa) % Pi / 2 < aa) {
			arrowDistance = w / Math.abs(ss);
		} else {
			arrowDistance = h / Math.abs(cc);
		}

		var x = cW + ss * arrowDistance,
		    y = cH + cc * arrowDistance,
		    point = Arrow.calcPoint(x, y, angle, 2, size),
		    side1 = Arrow.calcPoint(x, y, angle, 1.5, size),
		    side2 = Arrow.calcPoint(x, y, angle, 0.5, size);

		
		// Draw arrow
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.fillStyle = 'rgba(155,55,255,'+Arrow.OPACITY+')';
		context.beginPath();
		context.moveTo(point.x, point.y);
		context.lineTo(side1.x, side1.y);
		context.lineTo(side2.x, side2.y)
		context.closePath();
		context.fill();
		context.restore();
	}
};

/**
 * Calculate point
 * @static
 * @method calcPoint
 * @param {int} x
 * @param {int} y
 * @param {float} angle
 * @param {int} angleMultiplier
 * @param {int} length
 * @returns {Object} with x and y as point
 */
Arrow.calcPoint = function(x, y, angle, angleMultiplier, length) {
	var c  = angle + Pi * angleMultiplier;
	return {
		x: x + Math.cos( c ) * length,
		y: y + Math.sin( c ) * length
	}
};

Y.namespace('TS.engine').Arrow = Arrow;

}, '1.0', {requires: ['plugin']});
