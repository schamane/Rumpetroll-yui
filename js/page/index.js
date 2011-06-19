YUI().add('page-index', function(Y){

/**
 * Page object
 */	
	
var Lang = Y.Lang,
	TS = Y.TS;

/**
 * Index page
 * @constructor
 */
var Page = function() {
	Page.superclass.constructor.apply(this, arguments);
};

Page.NAME = "page-index";
Page.CANVAS_CONTENT_ID = '#canvas';
Page.APP_SOCKET = "ws://localhost:8181";

Y.extend(Page, Y.Base);

/**
 * initialize page, create engine and start render
 * @method initializer
 */
Page.prototype.initializer = function() {
	if(Modernizr.canvas) {
	    this.app = new TS.engine.App({contentBox: Page.CANVAS_CONTENT_ID, socket: Page.APP_SOCKET});
	    this.app.render();
	    /*
	    if(userLogined)
	    	this.app.setUsername("LoginedUserName");
	    	*/
	} else {
		Y.log("Browser doenst support canvas", "error");
	    Y.one('#content').setContent("Sorry, no canvas support :(");
	}
};

Y.namespace("TS").IndexPage = Page;

},'1.0', { requires: ['node', 'dump', 'ts-engine-app']});

/**
 * initialize page
 */

YUI().use('page-index', function(Y){
    
	new Y.TS.IndexPage();
    
});
