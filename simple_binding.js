var om = require('./');

var s_lookup		= om.s_lookup;
var vtable_vt 		= om.vtable_vt;
var vtable_lookup 	= om.vtable_lookup;

function bind(rcv, msg) {
	var c, vt = rcv.$vt;
	return (msg === s_lookup && rcv === vtable_vt)
		? vtable_lookup(null, vt, msg)
		: send(vt, s_lookup, msg);
}

var slice = Array.prototype.slice;

function send(rcv, msg) {
	var closure = bind(rcv, msg);
	var args = slice.call(arguments);
	args[0] = closure;
	args[1] = rcv;
	return closure.method.apply(null, args);
}

var obj = om.make_object();
obj.$vt = send(om.object_vt, om.s_delegated);

console.log(obj.$vt);