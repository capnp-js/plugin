var Struct = require('capnp-js/lib/base/Struct');
var Data = require('capnp-js/lib/base/Data');
var Text = require('capnp-js/lib/base/Text');
var List = require('capnp-js/lib/base/List');
var AnyPointer = require('capnp-js/lib/base/AnyPointer');

/*
 * Primary use case is testing.  AnyPointers map to `'[AnyPointer]'` not a nice
 * dump for general use, but good for testing.  Circular reference will bring
 * this crashing down too.
 */
var objectify = function (reader) {
    var object = {};
    for (var key in reader) {
        var v = reader[key];
        if (v instanceof Struct) {
            object[key] = objectify(v);
        } else if (v instanceof List) {
            if (v instanceof Data) {
                object[key] = v.raw;
            } else if (v instanceof Text) {
                object[key] = v.string;
            } else {
                /* TODO: map for list types. */
                object[key] = v.map(objectify);
            }
        } else if (v instanceof AnyPointer) {
            object[key] = '[AnyPointer]';
        } else {
            object[key] = v;
        }
    }

    return object;
};

module.exports = objectify;
