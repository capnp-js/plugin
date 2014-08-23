define(['./toBase64', './joinId'], function (
           toBase64,     joinId) {

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
            datum : {
                type : typeF(constant.getType(), index),
                value : valueF(constant.getValue(), index)
            }
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
            offset : slot.getOffset(),
            hadExplicitDefault : slot.getHadExplicitDefault()
        };

        s.defaultValue = valueF(slot.getDefaultValue(), index).value;
        merge(s, typeF(slot.getType()));

        return s;
    };

    var groupF = function (group, index) {
        return structureF(index[joinId(group.getTypeId())], index);
    };

    var fieldF = function (field, index) {
        var name = { name : field.getName() };

        if (field.isSlot()) {
            return merge(slotF(field.getSlot(), index), name);

        } else if (field.isGroup()) {
            return merge(groupF(field.getGroup(), index), name);

        } else { throw new Error(); }
    };

    var structureF = function (node, index) {
        var struct = node.getStruct();

        var fields = struct.getFields().map(function (f) {
            return fieldF(f, index);
        });

        var nodes = node.getNestedNodes().map(function (n) {
            return nodeF(n, index);
        });

        var n = {
            dataWordCount : struct.getDataWordCount(),
            pointerCount : struct.getPointerCount(),
            preferredListEncoding : struct.getPreferredListEncoding(),
            discriminantCount : struct.getDiscriminantCount(),
            discriminantOffset : struct.getDiscriminantOffset(),
            fields : fields,
            nodes : nodes
        };

        if (struct.getIsGroup()) {
            n.type = "group";
        } else {
            n.meta = "struct";
            n.id = joinId(node.getId());
        }

        return n;
    };

    var typeF = function (t, index) {
        if (t.isVoid()) {
            return { type : "Void" };

        } else if (t.isBool()) {
            return { type : "Bool" };

        } else if (t.isInt8()) {
            return { type : "Int8" };

        } else if (t.isInt16()) {
            return { type : "Int16" };

        } else if (t.isInt32()) {
            return { type : "Int32" };

        } else if (t.isInt64()) {
            return { type : "Int64" };

        } else if (t.isUint8()) {
            return { type : "UInt8" };

        } else if (t.isUint16()) {
            return { type : "UInt16" };

        } else if (t.isUint32()) {
            return { type : "UInt32" };

        } else if (t.isUint64()) {
            return { type : "UInt64" };

        } else if (t.isFloat32()) {
            return { type : "Float32" };

        } else if (t.isFloat64()) {
            return { type : "Float64" };

        } else if (t.isData()) {
            return { type : "Data" };

        } else if (t.isText()) {
            return { type : "Text" };

        } else if (t.isEnum()) {
            return { type : "enum" };

        } else if (t.isAnyPointer()) {
            return { type : "AnyPointer" };

        } else if (t.isList()) {
            return {
                meta : "list",
                type : typeF(t.getList().getElementType())
            };

        } else if (t.isStruct()) {
            return {
                meta : "struct",
                id : joinId(t.getStruct().getTypeId())
            };

        } else if (t.isInterface()) {
            return {
                meta : "interface",
                id : joinId(t.getInterface().getTypeId())
            };

        } else { throw new Error(); }
    };

    var valueF = function (v, index) {
        if (v.isVoid()) {
            return { value : v.getVoid() };

        } else if (v.isBool()) {
            return { value : v.getBool() };

        } else if (v.isInt8()) {
            return { value : v.getInt8() };

        } else if (v.isInt16()) {
            return { value : v.getInt16() };

        } else if (v.isInt32()) {
            return { value : v.getInt32() };

        } else if (v.isInt64()) {
            return { value : v.getInt64() };

        } else if (v.isUint8()) {
            return { value : v.getUint8() };

        } else if (v.isUint16()) {
            return { value : v.getUint16() };

        } else if (v.isUint32()) {
            return { value : v.getUint32() };

        } else if (v.isUint64()) {
            return { value : v.getUint64() };

        } else if (v.isFloat32()) {
            return { value : v.getFloat32() };

        } else if (v.isFloat64()) {
            return { value : v.getFloat64() };

        } else if (v.isData()) {
            return { value : v.getData() };

        } else if (v.isText()) {
            return { value : v.getText() };

        } else if (v.isEnum()) {
            return { value : v.getEnum() };

        } else if (v.isAnyPointer()) {
            /*
             * Need an allocator/something to consolidate a pointer and its data
             * to contiguous memory.  The corresponding buffer then gets base64
             * encoded.
             */
            return { value : toBase64(v.getAnyPointer()) };

        } else if (v.isList()) {
            return { value : toBase64(v.getList()) };

        } else if (v.isStruct()) {
            return { value : toBase64(v.getStruct()) };

        } else if (v.isInterface()) {
            return { value : t.getInterface() };

        } else { throw new Error(); }
    };

    var nodeF = function (node, index) {
        var name = { name : node.getName().asString() };
        node = index[joinId(node.getId())];

        if (node.isFile()) {
            throw new Error('Unanticipated layout');

        } else if (node.isStruct()) {
            return merge(structureF(node, index), name);

        } else if (node.isEnum()) {
            return merge(enumerationF(node, index), name);
            
        } else if (node.isInterface()) {
            throw new Error('Interfaces are not supported (yet)');

        } else if (node.isConst()) {
            return merge(constantF(node, index), name);
            
        } else if (node.isAnnotation()) {
            return merge(annotationF(node, index), name);

        } else { throw new Error(); }
    };

    return nodeF;
});
