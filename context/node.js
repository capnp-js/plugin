define(['capnp-js/builder/copy/pointer', 'capnp-js/builder/primitives', 'capnp-js/builder/Allocator', 'capnp-js/builder/AnyPointerBlob', 'capnp-js/wordAlign', './toBase64', './joinId', './size'], function (
                          copy,                    builder,                               Allocator,                    AnyPointerBlob,            wordAlign,     toBase64,     joinId,     size) {

    var allocator = new Allocator();

    var bytes = function (n) {
        // @if TARGET_ENV='browser'
        var data = new Uint8Array(n);
        // @endif

        // @if TARGET_ENV='node'
        var data = new Buffer(n);
        // @endif

        data._id = 0;
        data._position = n;

        return data;
    };

    var merge = function (target, source) {
        for (var k in source) {
            target[k] = source[k];
        }

        return target;
    };

    var annotationF = function (node, index) {
        return { meta : "annotation" };
    };

    var constantF = function (node, index) {
        var constant = node.getConst();
        return {
            meta : "const",
            id : joinId(node.getId()),
            datum : merge(
                typeF(constant.getType(), index),
                valueF(constant.getValue(), index)
            )
        };
    };

    var enumerantF = function (node, index) {
        return { name : node.getName().asString() };
    };

    var enumerationF = function (node, index) {
        var enumeration = node.getEnum();

        var enumerants = enumeration.getEnumerants().map(function (e) {
            return enumerantF(e, index);
        });

        return {
            meta : "enum",
            id : joinId(node.getId()),
            enumerants : enumerants
        };
    };

    var slotF = function (slot, index) {
        var s = {
            offset : slot.getOffset()
        };

        merge(s, typeF(slot.getType()));
        merge(s, defaultValueF(slot.getDefaultValue(), index));

        return s;
    };

    var groupF = function (group, index) {
        return structureF(index[joinId(group.getTypeId())], index);
    };

    var fieldF = function (field, index) {
        var base = {
            name : field.getName().asString(),
            discriminantValue : field.getDiscriminantValue()
        };

        if (field.isSlot()) {
            return merge(slotF(field.getSlot(), index), base);

        } else if (field.isGroup()) {
            return merge(groupF(field.getGroup(), index), base);

        } else { throw new Error(); }
    };

    var structureF = function (node, index) {
        var struct = node.getStruct();

        var n = {
            dataWordCount : struct.getDataWordCount(),
            pointerCount : struct.getPointerCount(),
            preferredListEncoding : struct.getPreferredListEncoding(),
            discriminantCount : struct.getDiscriminantCount(),
        };

        var fields = struct.getFields();
        if (fields.length() > 0) {
            n.fields = fields.map(function (f) {
                return fieldF(f, index);
            });
        }

        var nodes = node.getNestedNodes();
        if (nodes.length() > 0) {
            n.nodes = nodes.map(function (n) {
                return nodeF(n, index);
            });
        }

        if (struct.getDiscriminantCount() > 0) {
            n.discriminantOffset = struct.getDiscriminantOffset();
        }

        if (struct.getIsGroup()) {
            n.type = "group";
        } else {
            n.meta = "struct";
            n.id = joinId(node.getId());
        }

        return n;
    };

    var typeF = function (t, index) {
        switch (t.which()) {
        case t.VOID: return { type : "Void" };
        case t.BOOL: return { type : "Bool" };
        case t.INT8: return { type : "Int8" };
        case t.INT16: return { type : "Int16" };
        case t.INT32: return { type : "Int32" };
        case t.INT64: return { type : "Int64" };
        case t.UINT8: return { type : "UInt8" };
        case t.UINT16: return { type : "UInt16" };
        case t.UINT32: return { type : "UInt32" };
        case t.UINT64: return { type : "UInt64" };
        case t.FLOAT32: return { type : "Float32" };
        case t.FLOAT64: return { type : "Float64" };
        case t.DATA: return { type : "Data" };
        case t.TEXT: return { type : "Text" };
        case t.ANY_POINTER: return { type : "AnyPointer" };
        case t.ENUM: return {
            meta : "enum",
            id : joinId(t.getEnum().getTypeId())
        };

        case t.LIST:
            var child = typeF(t.getList().getElementType());
            return {
                meta : "list",
                type : child.meta === undefined ? child.type : child
            };

        case t.STRUCT: return {
            meta : "struct",
            id : joinId(t.getStruct().getTypeId())
        };

        case t.INTERFACE: return {
            meta : "interface",
            id : joinId(t.getInterface().getTypeId())
        };

        default: throw new Error();
        }
    };

    var any = function (instance) {
        var apb = new AnyPointerBlob(instance._arena, instance._pointer);
        var arena = allocator.createArena(8 + size(instance._arena, apb._layout()));

        // Admit installation of non-structures to the arena's root.
        copy.deep(apb, arena, arena._root());

        return toBase64(arena.getSegment(0));
    };

    var blob = function (instance) {
        var arena = allocator.createArena(wordAlign(8 + instance._length));
        copy.deep(instance, arena, arena._root());

        return toBase64(arena.getSegment(0));
    };

    var defaultValueF = function (v, index) {
        function f(value) {
            return { defaultValue : value };
        }

        var zero = f("AAAAAAAAAAA=");
        var value, data;

        switch (v.which()) {
        case v.VOID: return f(v.getVoid());
        case v.BOOL: return f(v.getBool() | 0);
        case v.INT8: return f(v.getInt8());
        case v.INT16: return f(v.getInt16());
        case v.INT32: return f(v.getInt32());
        case v.INT64: return f(v.getInt64());
        case v.UINT8: return f(v.getUint8());
        case v.UINT16: return f(v.getUint16());
        case v.UINT32: return f(v.getUint32());
        case v.UINT64: return f(v.getUint64());
        case v.FLOAT32:
            value = v.getFloat32();
            data = bytes(4);
            builder.float32(value, data, 0);
            return {
                defaultValue : value,
                defaultBytes : toBase64(data)
            };

        case v.FLOAT64:
            value = v.getFloat64();
            data = bytes(8);
            builder.float64(value, data, 0);
            return {
                defaultValue : value,
                defaultBytes : toBase64(data)
            };

        case v.ENUM: return f(v.getEnum());
        case v.DATA:
            value = v.getData();
            return value === v._defaults.data ? zero : f(blob(value));

        case v.TEXT:
            value = v.getText();
            return value === v._defaults.text ? zero : f(blob(value));

        case v.ANY_POINTER:
            value = v.getAnyPointer();
            return value === v._defaults.any ? zero : f(any(value));

        case v.LIST:
            value = v.getList();
            return value === v._defaults.list ? zero : f(any(value));

        case v.STRUCT:
            value = v.getStruct();
            return value === v._defaults.struct ? zero : f(any(value));

        case v.INTERFACE: throw new Error('Interfaces are not supported');
        default: throw new Error('Unrecognized value type: '+v.which());
        }
    };

    var valueF = function (v, index) {
        function f(value) {
            return { value : value };
        }

        var value, data;
        switch (v.which()) {
        case v.VOID: return f(v.getVoid());
        case v.BOOL: return f(v.getBool() | 0);
        case v.INT8: return f(v.getInt8());
        case v.INT16: return f(v.getInt16());
        case v.INT32: return f(v.getInt32());
        case v.INT64: return f(v.getInt64());
        case v.UINT8: return f(v.getUint8());
        case v.UINT16: return f(v.getUint16());
        case v.UINT32: return f(v.getUint32());
        case v.UINT64: return f(v.getUint64());
        case v.FLOAT32:
            value = v.getFloat32();
            data = bytes(4);
            builder.float32(value, data, 0);
            return {
                value : value,
                bytes : toBase64(data)
            };

        case v.FLOAT64:
            value = v.getFloat64();
            data = bytes(8);
            builder.float64(value, data, 0);
            return {
                value : value,
                bytes : toBase64(data)
            };

        case v.ENUM: return f(v.getEnum());
        case v.DATA: return f(blob(v.getData()));
        case v.TEXT: return f(blob(v.getText()));
        case v.ANY_POINTER: return f(any(v.getAnyPointer()));
        case v.LIST: return f(any(v.getList()));
        case v.STRUCT: return f(any(v.getStruct()));
        case v.INTERFACE: throw new Error('Interfaces are not supported');
        default: throw new Error('Unrecognized value type: '+v.which());
        }
    };

    var nodeF = function (node, index) {
        var name = { name : node.getName().asString() };
        node = index[joinId(node.getId())];

        switch (node.which()) {
        case node.FILE: throw new Error('Unanticipated layout');
        case node.STRUCT: return merge(structureF(node, index), name);
        case node.ENUM: return merge(enumerationF(node, index), name);
        case node.INTERFACE: throw new Error('Interfaces are not supported (yet)');
        case node.CONST: return merge(constantF(node, index), name);
        case node.ANNOTATION: return merge(annotationF(node, index), name);
        default: throw new Error();
        }
    };

    return nodeF;
});
