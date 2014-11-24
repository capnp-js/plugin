define(['capnp-js/builder/copy/pointer', 'capnp-js/builder/primitives', 'capnp-js/builder/Allocator', 'capnp-js/reader/layout/any', 'capnp-js/wordAlign', './toBase64', './joinId', './size'], function (
                          copy,                    builder,                               Allocator,                   layout,                wordAlign,     toBase64,     joinId,     size) {

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
        return { name : node.getName().toString() };
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
            name : field.getName().toString(),
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

    var brandF = function (typeId, brand, index) {
        var f = { id : joinId(typeId)  };

        var scopes = {};
        brand.getScopes().forEach(function (s) {
            if (s.isBind()) scopes[joinId(s.getScopeId())] = s.getBind();
        });

        if (f.id in scopes) {
            f.parameters = scopes[f.id].map(function (binding) {
                if (binding.isUnbound()) {
                    return 'AnyPointer'
                } else {
                    return typeF(binding.getType(), index);
                }
            });
        } else {
            f.parameters = index[f.id].getParameters().map(function (p) {
                return 'AnyPointer';
            });
        }

        return f;
    };

    var typeF = function (t, index) {
        var f = {};
        switch (t.which()) {
        case t.VOID: f.type = "Void"; break;
        case t.BOOL: f.type = "Bool"; break;
        case t.INT8: f.type = "Int8"; break;
        case t.INT16: f.type = "Int16"; break;
        case t.INT32: f.type = "Int32"; break;
        case t.INT64: f.type = "Int64"; break;
        case t.UINT8: f.type = "UInt8"; break;
        case t.UINT16: f.type = "UInt16"; break;
        case t.UINT32: f.type = "UInt32"; break;
        case t.UINT64: f.type = "UInt64"; break;
        case t.FLOAT32: f.type = "Float32"; break;
        case t.FLOAT64: f.type = "Float64"; break;
        case t.DATA: f.type = "Data"; break;
        case t.TEXT: f.type = "Text"; break;
        case t.ANY_POINTER:
            t = t.getAnyPointer();
            switch (t.which()) {
            case t.UNCONSTRAINED:
                f.type = "AnyPointer";
                break;
            case t.PARAMETER:
                f.type = "parameter";
                f.index = t.getParameter().getParameterIndex();
                break;
            case t.IMPLICIT_METHOD_PARAMETER:
                f.type = "AnyPointer";
                break;
            }
            break;
        case t.ENUM:
            t = t.getEnum();
            f.meta = "enum";
            f.type = brandF(t.getTypeId(), t.getBrand(), index);
            break;
        case t.LIST:
            var child = typeF(t.getList().getElementType(), index);
            f.meta = "list";
            f.type = child.meta === undefined ? child.type : child;
            break;
        case t.STRUCT:
            t = t.getStruct();
            f.meta = "struct";
            f.type = brandF(t.getTypeId(), t.getBrand(), index);
            break;
        case t.INTERFACE:
            t = t.getInterface();
            f.meta = "interface";
            f.type = brandF(t.getTypeId(), t.getBrand(), index);
            break;
        default: throw new Error();
        }

        return f;
    };

    var any = function (instance) {
        var bytes = size(
            instance._arena,
            layout.unsafe(instance._arena, instance._pointer)
        );
        var arena = allocator.createArena(8 + bytes);

        // Admit installation of non-structures to the arena's root.
        copy.setAnyPointer(
            instance._arena,
            instance._pointer,
            arena,
            arena._root()
        );

        return toBase64(arena.getSegment(0));
    };

    var blob = function (instance) {
        var arena = allocator.createArena(wordAlign(8 + instance._length));
        copy.setListPointer(
            instance._arena,
            instance._layout(),
            arena,
            arena._root()
        );

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
        var base = {
            name : node.getName().toString()
        };

        node = index[joinId(node.getId())];

        if (node.getParameters().length() > 0) {
            base.parameters = node.getParameters().map(function (p) {
                return p.getName().toString();
            });
        }

        switch (node.which()) {
        case node.FILE: throw new Error('Unanticipated layout');
        case node.STRUCT: return merge(structureF(node, index), base);
        case node.ENUM: return merge(enumerationF(node, index), base);
        case node.INTERFACE: throw new Error('Interfaces are not supported (yet)');
        case node.CONST: return merge(constantF(node, index), base);
        case node.ANNOTATION: return merge(annotationF(node, index), base);
        default: throw new Error();
        }
    };

    return nodeF;
});
