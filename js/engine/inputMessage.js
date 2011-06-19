YUI().add( 'ts-engine-inputmessage',function(Y) {

var Keys = Y.TS.engine.Keys;

var InputMessage = function() {
	InputMessage.superclass.constructor.apply(this, arguments);
};

InputMessage.NAME = "ts-engine-inputmessage";
InputMessage.ATTRS = {
    hidden: { 
		value: true,
		setter: function(hidden) {
		    var contentBox = this.get('contentBox');
		    if(hidden) {
			//contentBox.setStyle("display", "none");
			contentBox.setStyle("opacity","0");
			this.messagePointer = this.messageHistory.length;
			contentBox.set('value','');
			this.chatText.setContent('');
			this.updateDimensions();
		    } else {
			contentBox.setStyle("opacity","1");
			//contentBox.setStyle("display", "inline-block");
		    }
		    return hidden;
		}
	    }
};

Y.extend( InputMessage, Y.Widget);


InputMessage.prototype.initializer = function() {
	//Y.log("init chat", "info");
	var contentBox = this.get('contentBox');
	this.chatText = Y.one("#chatText");
	
	this.messageHistory = [];
	this.messagePointer = -1;
	contentBox.on('blur', function(e) {
		//Y.log("blur, set focus");
		Y.later(1, this, function(){contentBox.focus()});
	}, this);
	
	Y.on('keydown', this._keydown, document, this);
	Y.on('keyup', this._keyup, document, this);
	contentBox.focus();
	//contentBox.setStyle('top', "-100px");
	contentBox.setStyle('width', "0");
	//Y.log("chat get focus");
};

InputMessage.prototype.closechat = function() {
	this.set('hidden', true);
};

InputMessage.prototype.updateDimensions = function(){
	var width = this.chatText.get('offsetWidth') + 30,
	    contentBox= this.get('contentBox'),
	    value = contentBox.get('value');
	this.chatText.setContent(value);
	contentBox.setStyle('width', width);
	contentBox.setStyle('marginLeft', (width/2)*-1);
};

InputMessage.prototype._keydown = function(e){
	var contentBox = this.get('contentBox'),
	    value = contentBox.get('value'),
	    length = value.length;
	if(length > 0) {
		//set timeout because event occurs before text is entered
		Y.later(1, this, this.updateDimensions);
		contentBox.setStyle("opacity","1");
	} else {
		this.closechat();
	}
	
	if(!this.get('hidden')) {
		e.stopPropagation();
		if(this.messageHistory.length > 0) {
			if(e.keyCode == Keys.up) {
				if(this.messagePointer > 0) {
					this.messagePointer--;
					contentBox.set('value', this.messageHistory[this.messagePointer]);
				}
			} else if(e.keyCode == Keys.down) {
				if(this.messagePointer < this.messageHistory.length-1) {
					this.messagePointer++;
					contentBox.set('value', this.messageHistory[this.messagePointer]);
				} else {
					this.closechat();
					return;
				}
			}
		}
	}
};

InputMessage.prototype._keyup = function(e) {
	var k = e.keyCode,
	    contentBox = this.get('contentBox'),
	    value = contentBox.get('value'),
	    length = value.length;
	if(length >= 45) {
		value = value.substr(0,45);
		length = value.length;
		contentBox.set('value', value);
	}
	if(length > 0) {
		this.set('hidden', false);
	} else {
		this.closechat();
	}
	if(!this.get('hidden')) {
		if(k == Keys.esc || k == Keys.enter || (k == Keys.space && length > 35)) {
			if(k != Keys.esc && length > 0) {
				this.messageHistory.push(value);
	    			this.messagePointer = this.messageHistory.length;
				Y.log("send message input Message");
				this.fire("send-message", contentBox.get('value'));
			}
			this.closechat();
		}
		
		e.stopPropagation();
	}
};

Y.namespace('TS.engine').InputMessage = InputMessage;

}, '1.0', {requires: ['widget', 'ts-engine-keys', 'node']});