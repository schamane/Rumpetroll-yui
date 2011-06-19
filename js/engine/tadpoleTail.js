YUI().add( 'ts-engine-tadpole-tail',function(Y) {

var Pi = Math.PI,
    Pi2 = Pi * 2;

var Joint = function() {
    Joint.superclass.constructor.apply( this, arguments );
    this.x = 0;
    this.y = 0;
};

Joint.NAME = "joint";
Joint.ATTRS = {
    angle:	{ value:  Pi2 }
};

Y.extend( Joint, Y.Base );


var TadpoleTail = function() {
	TadpoleTail.superclass.constructor.apply( this, arguments );
};

TadpoleTail.NS = "tail";
TadpoleTail.NAME = "ts-engine-tadpole-tail";
TadpoleTail.BODY_SPACE = 2;
TadpoleTail.ATTRS = {
	joints: { value: [] },
	length: { value: 15 },
	spacing: { value: 1.6 },
	animationRate: { value: 0 }
};

Y.extend( TadpoleTail, Y.Plugin.Base );

TadpoleTail.prototype.initializer = function() {
	var joints = [],
	    i, length = this.get('length');
	for(i = 0; i < length; i++) {
		joints.push( new Joint() );
	}
	Y.log("set joints", "info");
	this.set('joints', joints);
	this.afterHostMethod("update", this.update);
	this.afterHostMethod("draw", this.draw);
	//this.afterHostEvent("tailDraw", this.draw);
	Y.log("set methods after host done", "info");
};


TadpoleTail.prototype.update = function() {
	var host = this.get('host'),
	    momentum = host.get('momentum'),
	    animationRate = this.get('animationRate'),
	    jointSpacing = this.get('spacing'),
	    i, length = this.get('length'),
	    joints = this.get('joints'),
	    tailJoint, parentJoint, anglediff,
	    pJangle, tJangle, x, y, tJPi;
	
	animationRate += (.2 + momentum / 10);
	this.set('animationRate', animationRate);
	
	for(i = 0; i < length; i++) {
		tailJoint = joints[i];
		parentJoint = joints[i-1] || host;
		pJangle = parentJoint.get('angle'),
		tJangle = tailJoint.get('angle'),
		anglediff = (pJangle - tJangle);
		x = parentJoint.x;
		y = parentJoint.y;
		
		while(anglediff < - Pi) {
			anglediff += Pi2;
		}
		while(anglediff > Pi) {
			anglediff -= Pi2;
		}
		
		tJangle += anglediff * (jointSpacing * 3 + (Math.min(momentum / 2, Pi * 1.8))) / 8;
		tJangle += Math.cos(animationRate - (i / 3)) * ((momentum + .3) / 40);
		tJPi = tJangle + Pi;
		
		if(i == 0) {
			tailJoint.x = x + Math.cos(tJPi) * TadpoleTail.BODY_SPACE;
			tailJoint.y = y + Math.sin(tJPi) * TadpoleTail.BODY_SPACE;
		} else {
			tailJoint.x = x + Math.cos(tJPi) * jointSpacing;
			tailJoint.y = y + Math.sin(tJPi) * jointSpacing;
		}
		tailJoint.set('angle', tJangle);
	}
};

TadpoleTail.prototype.draw = function() {
	var path = [[],[]],
	    host = this.get('host'),
	    opacity = host.opacity,
	    hostAngle = host.get('angle'),
	    size = host.get('size'),
	    context = host.get('context'),
	    i, length = this.get('length'),
	    joints = this.get('joints'),
	    angle, x, y,
	    tailJoint, falloff, 
	    jointSize = size-0.8,
	    x1, x2, y1, y2;
	
	for(i = 0; i < length; i++) {
		tailJoint = joints[i];
		angle = tailJoint.get('angle');
		x = tailJoint.x;
		y = tailJoint.y;
		
		falloff = (length - i) / length;
		if(i > 0){
			jointSize =  (size-1.8) * falloff;
		}
		
		x1 = x + Math.cos(angle + Pi * 1.5) * jointSize;
		y1 = y + Math.sin(angle + Pi * 1.5) * jointSize;
		
		x2 = x + Math.cos(angle + Pi / 2) * jointSize;
		y2 = y + Math.sin(angle + Pi / 2) * jointSize;
		
		path[0].push({x: x1, y: y1});
		path[1].push({x: x2, y: y2});
	}
	
	context.save();
	
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur    = 6;
	context.shadowColor   = 'rgba(255, 255, 255, '+opacity*0.7+')';
	
	context.beginPath();
	context.moveTo(path[0][0].x, path[0][0].y);
	
	for(i = 1; i < length; i++) {
		context.lineTo(path[0][i].x, path[0][i].y);
	}
	path[1].reverse();
	for(i = 0; i < length; i++) {
		context.lineTo(path[1][i].x, path[1][i].y);
	}
	context.closePath();
	context.fill();
	
	context.restore();
};

Y.namespace('TS.engine').TadpoleTail = TadpoleTail;

}, '1.0', {requires: ['plugin']});
