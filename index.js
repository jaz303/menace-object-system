function vtable() {
	this.$vt = null;
	this.entries = {};
	this.parent = null;
}

function object() {
	this.$vt = null;
}

function closure() {
	this.$vt = null;
	this.method = null;
	this.data = null;
}

function symbol() {
	this.$vt = null;
	this.str = null;
}

function make_object() {
	return new object();
}

function make_symbol(str) {
	var sym = new symbol();
	sym.$vt = symbol_vt;
	sym.str = str;
	return sym;
}

function make_closure(method, data) {
	var clo = new closure();
	clo.$vt = closure_vt;
	clo.method = method;
	clo.data = data;
	return clo;
}

function vtable_delegated(closure, self) {
	var child = new vtable();
	child.$vt = self ? self.$vt : null;
	child.parent = self;
	return child;
}

function vtable_allocate(closure, self) {
	var obj = new vtable();
	obj.$vt = self;
	return obj;
}

function vtable_add_method(closure, self, key, method) {
	self.entries[key.str] = make_closure(method, null);
	return method;
}

function vtable_lookup(closure, self, key) {
	if (key.str in self.entries) {
		return self.entries[key.str];
	} else {
		throw new Error("unknown key in vtable: " + key.str);
	}
}

var symbols = {};

function symbol_intern(closure, self, str) {
	if (symbols[str]) {
		return symbols[str];
	} else {
		var sym = make_symbol(str);
		symbols[str] = sym;
		return sym;
	}
}

var vtable_vt = vtable_delegated(null, null);
vtable_vt.$vt = vtable_vt;

var object_vt = vtable_delegated(null, null);
object_vt.$vt = vtable_vt;
vtable_vt.parent = object_vt;

var symbol_vt = vtable_delegated(null, object_vt);
var closure_vt = vtable_delegated(null, object_vt);

var s_addMethod	= symbol_intern(null, null, 'addMethod');
var s_allocate	= symbol_intern(null, null, 'allocate');
var s_delegated	= symbol_intern(null, null, 'delegated');
var s_lookup	= symbol_intern(null, null, 'lookup');

vtable_add_method(null, vtable_vt, s_lookup, vtable_lookup);
vtable_add_method(null, vtable_vt, s_addMethod, vtable_add_method);
vtable_add_method(null, vtable_vt, s_allocate, vtable_allocate);
vtable_add_method(null, vtable_vt, s_delegated, vtable_delegated);

exports.vtable_vt		= vtable_vt;
exports.object_vt		= object_vt;
exports.symbol_vt 		= symbol_vt;
exports.closure_vt		= closure_vt;

exports.s_addMethod		= s_addMethod;
exports.s_allocate		= s_allocate;
exports.s_delegated		= s_delegated;
exports.s_lookup 		= s_lookup;

exports.vtable_lookup	= vtable_lookup;

exports.make_object 	= make_object;