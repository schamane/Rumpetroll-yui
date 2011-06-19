YUI().add( 'ts-engine-message',function(Y) {

var Message = function(msg) {
	Message.superclass.constructor.apply(this, arguments);
};


Message.NAME = "ts-engine-message";
Message.ATTRS = {
    age: { value: 1 },
    message: { value: "" },
    order: { value: 0}
};

Message.MAX_AGE = 300;

Y.extend( Message, Y.Base );

Message.prototype.update = function() {
	this.set('age',this.get('age')+1);
};

Message.prototype.draw = function(context,x,y,i) {
	var fontsize = 8,
	    message = this.get('message'),
	    opacity = this.opacity,
	    age = this.get('age');
	
	context.font = fontsize + "px 'proxima-nova-1','proxima-nova-2', arial, sans-serif";
	context.textBaseline = 'hanging';
	
	var paddingH = 3,
	    paddingW = 6,
	    paddingH2 = 6,
	    messageBox = {
			width: context.measureText(message).width + paddingW * 2,
			height: fontsize + paddingH2,
			x: x,
			y: (y - i * (fontsize + paddingH2 +1))-20
	    },
	
	    fadeDuration = 20,
	    opacity = (Message.MAX_AGE - age) / fadeDuration;
	
	opacity = opacity < 1 ? opacity : 1;
	
	context.fillStyle = 'rgba(255,255,255,'+opacity/20+')';
	this._drawRoundedRectangle(context, messageBox.x, messageBox.y, messageBox.width, messageBox.height, 10);
	context.fillStyle = 'rgba(255,255,255,'+opacity+')';
	context.fillText(message, messageBox.x + paddingW, messageBox.y + paddingH, 100);
	this.opacity = opacity;
};

Message.prototype._drawRoundedRectangle = function(ctx,x,y,w,h,r) {
	var r = r / 2;

	ctx.beginPath();
	ctx.moveTo(x, y+r);
	ctx.lineTo(x, y+h-r);
	ctx.quadraticCurveTo(x, y+h, x+r, y+h);
	ctx.lineTo(x+w-r, y+h);
	ctx.quadraticCurveTo(x+w, y+h, x+w, y+h-r);
	ctx.lineTo(x+w, y+r);
	ctx.quadraticCurveTo(x+w, y, x+w-r, y);
	ctx.lineTo(x+r, y);
	ctx.quadraticCurveTo(x, y, x, y+r);
	ctx.closePath();
	ctx.fill();
};

Y.namespace('TS.engine').Message = Message;

}, '1.0', {requires: ['base']});
