function mk_vtable() {
    return {
        vtable      : null,
        entries     : null,
        parent      : null
    };
}

function mk_object() {
    return {
        vtable      : null
    };
}

var vtable_vt = null;
var object_vt = null;

function bind(receiver, message) {
    var vt = receiver.vtable;
    return ((message === 'lookup') && (receiver === vtable_vt))
            ? vtable_lookup(vt, message)
            : send(vt, 'lookup', message);
}

function send(receiver, message, args) {
    var method = bind(receiver, message);
    if (method) {
        args = Array.prototype.slice.call(arguments, 0);
        args.splice(1, 1);
        return method.apply(null, args);
    } else {
        throw "unknown method: " + message;
    }
}

function vtable_allocate(self) {
    var obj = mk_object();
    obj.vtable = self;
    return obj;
}

function vtable_delegated(self) {
    var child = mk_vtable();
    child.vtable = self ? self.vtable : null;
    child.entries = {};
    child.parent = self;
    return child;
}

function vtable_add_method(self, name, method) {
    self.entries[name] = method;
}

function vtable_lookup(self, name) {
    if (name in self.entries)
        return self.entries[name];
    if (self.parent)
        return send(self.parent, 'lookup', name);
    console.log("lookup failed: " + name);
    return null;
}

vtable_vt = vtable_delegated(null);
vtable_vt.vtable = vtable_vt;

object_vt = vtable_delegated(null);
object_vt.vtable = vtable_vt;
vtable_vt.parent = object_vt;

vtable_add_method(vtable_vt, 'lookup', vtable_lookup);
vtable_add_method(vtable_vt, 'addMethod', vtable_add_method);

send(vtable_vt, 'addMethod', 'allocate', vtable_allocate);
send(vtable_vt, 'addMethod', 'delegated', vtable_delegated);

var sub_vt = send(vtable_vt, 'delegated');

send(sub_vt, 'addMethod', 'lookup', function(self, method) {
    return function(self) { return "this method is called " + method; }
});

send(sub_vt, 'addMethod', 'foobar', function(self, a, b) {
    return a + b;
});

var instance = send(sub_vt, 'allocate');

console.log(send(instance, 'foobar', 1, 2));
