YUI().add( 'ts-engine-water',function(Y) {

var Pi2 = Math.PI*2;

var WaterParticle = function() {
	WaterParticle.superclass.constructor.apply(this, arguments);
	this.x = 0;
	this.y = 0;
	this.z = Math.random() * 1 + 0.3;
};

WaterParticle.NAME = "ts-engine-water";
WaterParticle.ATTRS = {
    /*
    x:		{ value: 0 },
    y:		{ value: 0 },
    z:		{ valueFn: function() {
			return Math.random() * 1 + 0.3;
		}},
    */
    size:	{ value: 1.2 },
    opacity:	{ valueFn: function() {
			return Math.random() * 0.8 + 0.1;
		}},
    context:	{ }
};

Y.extend( WaterParticle, Y.Base );

WaterParticle.prototype.initializer = function() {
	this.on('update', this._update);
	this.on('draw', this._draw);
};

WaterParticle.prototype._update = function(bounds) {
	var x = this.x,
	    y = this.y,
	    bx0 = bounds[0].x,
	    bx1 = bounds[1].x,
	    by0 = bounds[0].y,
	    by1 = bounds[1].y;
	    //deltax, deltay, deltaz;
	if(x == 0 || y == 0) {
		x = Math.random() * (bx1 - bx0) + bx0;
		y = Math.random() * (by1 - by0) + by0;
	}
	//TODO: particle movement
	/*
	 else if( Math.random() > 0.99 ) {
	    deltax = Math.random()*2 - 1;
	    deltay = Math.random()*2 - 1;
	    deltaz = Math.random()*0.2;
	    x += deltax;
	    y += deltay;
	    z += deltaz;
	}
	*/
	
	// Wrap around screen
	x = x < bx0 ? bx1 : x;
	y = y < by0 ? by1 : y;
	this.x = x > bx1 ? bx0 : x;
	this.y = y > by1 ? by0 : y;
};

WaterParticle.prototype._updateWater = function(deltax, deltay){
	var z = this.z -1;
	this.x -= z * deltax;
	this.y -= z * deltay;
};

WaterParticle.prototype._draw = function() {
	var context = this.get('context'),
	    x = this.x,
	    y = this.y,
	    z = this.z,
	    size = this.get('size'),
	    opacity = this.get('opacity');
	// Draw circle
	context.fillStyle = 'rgba(226,219,226,'+opacity+')';
	context.beginPath();
	context.arc(x, y, z * size, 0, Pi2, true);
	context.closePath();
	context.fill();
};

Y.namespace('TS.engine').WaterParticle = WaterParticle;

}, '1.0', {requires: ['base']});
