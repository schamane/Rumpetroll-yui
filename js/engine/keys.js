YUI().add( 'ts-engine-keys',function(Y) {

var Keys = {
	esc: 27,
        enter: 13,
        space: 32,
        up: 38,
        down: 40,
	left:37,
	right:39
};

Y.namespace('TS.engine').Keys = Keys;

}, '1.0', {requires: []});

