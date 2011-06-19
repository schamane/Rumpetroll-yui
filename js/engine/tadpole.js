YUI().add( 'ts-engine-tadpole',function(Y) {

var TS = Y.TS,
    engine = TS.engine,
    TadpoleTail = engine.TadpoleTail,
    Pi = Math.PI,
    Pi2 = Pi * 2;

var Tadpole = function() {
	Tadpole.superclass.constructor.apply(this, arguments);
	this.x = Math.random() * 300 - 150;
	this.y = Math.random() * 300 - 150;
};

Tadpole.NAME = "ts-engine-tadpole";
Tadpole.ATTRS = {
    id:		{ value: -1 },
    /*
    x:		{ valueFn:  function() { return Math.random() * 300 - 150; }},
    y:		{ valueFn:  function() { return Math.random() * 300 - 150; }},
    */
    size:	{ value: 4 },
    name:	{ value: 'Guest'},
    age:	{ value: 0},
    hover:	{ value: false },
    momentum:	{ value: 0 },
    maxMomentum:	{ value: 3 },
    angle:	{value:  Pi2 },
    targetX:	{ value: 0 },
    targetY:	{ value: 0 },
    targetMomentum:	{ value: 0 },
    changed: 	{ value: 0 },
    messages: { value: [] },
    timeSinceLastActivity:	{ value: 0 },
    timeSinceLastServerUpdate:	{ value: 0 },
    context:	{}
};

Y.extend( Tadpole, Y.Base );
Y.mix(Tadpole, Y.Plugin.Host, false, null, 1);
Y.Plugin.Host.plug( Tadpole, TadpoleTail, { length: 15 } );

Tadpole.prototype.update = function(mouse) {
	var messages = this.get('messages'),
	    i, length = messages.length,
	    time = this.get('timeSinceLastServerUpdate'),
	    x = this.x,
	    y = this.y,
	    angle = this.get('angle'),
	    momentum = this.get('momentum'),
	    targetX = this.get('targetX'),
	    targetY = this.get('targetY');
	this.set('timeSinceLastServerUpdate', time + 1);
	
	x += Math.cos(angle) * momentum;
	y += Math.sin(angle) * momentum;
	
	if(targetX != 0 || targetY != 0) {
		x += (targetX - x) / 20;
		y += (targetY - y) / 20;
	}
	this.x = x;
	this.y = y;
	
	// Update messages
	
	for (var i = length - 1; i >= 0; i--) {
		var msg = messages[i];
		msg.update();
		//TODO:build old event instead of that
		if(msg.get('age') == 300) {// Message.MAX_AGE) {
			messages.splice(i,1);
		}
	}
	
	// Update tadpole hover/mouse state
	if(Math.sqrt(Math.pow(x - mouse.worldx,2) + Math.pow(y - mouse.worldy,2)) < this.get('size')+2) {
		this.set('hover', true);
		mouse.tadpole = this;
	}
	else {
		if(mouse.tadpole && mouse.tadpole.get('id') == this.get('id')) {
			//mouse.tadpole = null;
		}
		this.set('hover', false);
	}
};

Tadpole.prototype.onclick = function(e) {
	if(e.ctrlKey && e.which == 1) {
		if(isAuthorized() && this.hover) {
			window.open("http://twitter.com/" + this.name.substring(1));
			return true;
		}
	}
	else if(e.which == 2) {
		//todo:open menu
		e.preventDefault();
		return true;
	}
	return false;
};

Tadpole.prototype.userUpdate = function(angleTargetX, angleTargetY) {
	var angle = this.get('angle'),
	    momentum = this.get('momentum'),
	    prevState = {
		angle: angle,
		momentum: momentum
	    },
	    x = this.x,
	    y = this.y,
	    changed = this.get('changed'),
	    age = this.get('age'),
	    anglediff;
	
	this.set('age', age++);
	
	// Angle to targetx and targety (mouse position)
	anglediff = ((Math.atan2(angleTargetY - y, angleTargetX - x)) - angle);
	while(anglediff < -Pi) {
		anglediff += Pi2;
	}
	while(anglediff > Pi) {
		anglediff -= Pi2;
	}
	
	angle += anglediff / 5;
	
	// Momentum to targetmomentum
	if(this.get('targetMomentum') != momentum) {
		momentum += (this.get('targetMomentum') - momentum) / 20;
	}
	
	if(momentum < 0) {
		momentum = 0;
	}
	
	changed += Math.abs((prevState.angle - angle)*3) + momentum;
	
	this.set('angle', angle );
	this.set('momentum', momentum );
	this.set('changed', changed );
};

Tadpole.prototype.draw = function() {
	var opacity = Math.max(Math.min(20 / Math.max(this.get('timeSinceLastServerUpdate')-300,1),1),.2).toFixed(3),
	    context = this.get('context'),
	    angle = this.get('angle');
	
	if(this.get('hover') && this.isAuthorized()) {
		context.fillStyle = 'rgba(192, 253, 247,'+opacity+')';
		// context.shadowColor   = 'rgba(249, 136, 119, '+opacity*0.7+')';
	} else {
		context.fillStyle = 'rgba(226,219,226,'+opacity+')';
	}
	
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur    = 6;
	context.shadowColor   = 'rgba(255, 255, 255, '+opacity*0.7+')';
	
	// Draw circle
	context.beginPath();
	context.arc(this.x, this.y, this.get('size'), angle + Pi * 2.7, angle + Pi * 1.3, true);
	
	context.closePath();
	context.fill();
	
	this.fire('tailDraw');
	
	context.shadowBlur = 0;
	context.shadowColor   = '';
	
	this.drawName();
	this.drawMessages();
};

Tadpole.prototype.isAuthorized = function() {
	return this.get('name').charAt('0') == "@";
};

Tadpole.prototype.drawName = function() {
	var opacity = Math.max(Math.min(20 / Math.max(this.get('timeSinceLastServerUpdate')-300,1),1),.2).toFixed(3),
	    context = this.get('context'),
	    name = this.get('name');
	context.fillStyle = 'rgba(226,219,226,'+opacity+')';
	context.font = 7 + "px 'proxima-nova-1','proxima-nova-2', arial, sans-serif";
	context.textBaseline = 'hanging';
	var width = context.measureText(name).width;
	context.fillText(name, this.x - width/2, this.y + 8);
}

Tadpole.prototype.drawMessages = function() {
	var context = this.get('context'),
	    messages = this.get('messages'),
	    len = messages.length,
	    len1 = len -1,
	    i;
	for(i = len1; i>=0; i--) {
		messages[i].draw(context, this.x+10, this.y+5, len1-i);
	}
};

Tadpole.prototype.setMaxMomentum = function() {
    var max = this.get('maxMomentum');
    this.set('momentum', max);
    this.set('targetMomentum', max);
};

Tadpole.prototype.stop = function() {
    //Y.log("Tadpole.prototype.stop", "info");
    this.set('targetMomentum', 0);
};

Y.namespace('TS.engine').Tadpole = Tadpole;

}, '1.0', {requires: ['base', 'pluginhost', 'ts-engine-tadpole-tail']});