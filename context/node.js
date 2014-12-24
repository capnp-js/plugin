define(['capnp-js/builder/copy/pointer', 'capnp-js/builder/primitives', 'capnp-js/builder/Allocator', 'capnp-js/reader/layout/any', 'capnp-js/wordAlign', '../cgr/readers', './toBase64', './joinId', './size'], function (
                          copy,                    builder,                               Allocator,                   layout,                wordAlign,      cgr,             toBase64,     joinId,     size) {

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

    var encodeAny = function (instance) {
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

    var encodeBlobType = function (instance) {
        var arena = allocator.createArena(wordAlign(8 + instance._length));
        copy.setListPointer(
            instance._arena,
            instance._layout(),
            arena,
            arena._root()
        );

        return toBase64(arena.getSegment(0));
    };

    var merge = function (target, source) {
        for (var k in source) {
            target[k] = source[k];
        }

        return target;
    };

    var top = function (stack) {
        return stack[stack.length-1];
    };

    var pushCall = function (staleStack, index, pushee, fn) {
        staleStack.push(pushee);
        var returns = fn(staleStack, index);
        staleStack.pop();

        return returns;
    };

    var currentScopeId = function (stack) {
        for (var i=stack.length-1; i>=0; --i) {
            if (stack[i]._TYPE === cgr.Node._TYPE && !stack[i].isConst()) {
                /*
                 * A constant is not a scope.  I'm not sure about annotations as
                 * I write this.
                 */
                return joinId(stack[i].getId());
            }
        }

        throw new Error('No parent scope found');
    };

    var annotationF = function (stack, index) {
        var node = top(stack);

        return { meta : "annotation" };
    };

    var constantF = function (stack, index) {
        var node = top(stack);
        var constant = node.getConst();

        var c = {
            meta : "const",
            id : joinId(node.getId()),
            datum : {}
        };

        merge(c.datum, pushCall(stack, index, constant.getType(), typeF));
        merge(c.datum, pushCall(stack, index, constant.getValue(), valueF));

        return c;
    };

    var enumerantF = function (stack, index) {
        var node = top(stack);
        return { name : node.getName().toString() };
    };

    var enumerationF = function (stack, index) {
        var node = top(stack);
        var enumeration = node.getEnum();

        return {
            meta : "enum",
            id : joinId(node.getId()),
            enumerants : enumeration.getEnumerants().map(function (e) {
                return pushCall(stack, index, e, enumerantF);
            })
        };
    };

    var slotF = function (stack, index) {
        var slot = top(stack);
        var s = {
            offset : slot.getOffset()
        };

        merge(s, pushCall(stack, index, slot.getType(), typeF));
        merge(s, pushCall(stack, index, slot.getDefaultValue(), defaultValueF));

        return s;
    };

    var groupF = function (stack, index) {
        var group = top(stack);
        var node = index[joinId(group.getTypeId())];

        return pushCall(stack, index, node, structureF);
    };

    var fieldF = function (stack, index) {
        var field = top(stack);
        var base = {
            name : field.getName().toString(),
            discriminantValue : field.getDiscriminantValue()
        };

        if (field.isSlot()) {
            return merge(base, pushCall(stack, index, field.getSlot(), slotF));
        } else if (field.isGroup()) {
            return merge(base, pushCall(stack, index, field.getGroup(), groupF));
        } else {
            throw new Error();
        }
    };

    var structureF = function (stack, index) {
        var node = top(stack);
        var struct = node.getStruct();

        var base;
        if (struct.getIsGroup()) {
            /*
             * All groups expose a `_PARENT`, analogous to generics.  The type
             * of parameter AnyPointers gets resolved by chaining `._PARENT`s,
             * so groups need not distinguish between the generic and
             * non-generic cases.
             */
            base = {
                type : "group"
            };

        } else {
            base = {
                meta : "struct",
                id : joinId(node.getId()),
                nodes : node.getNestedNodes().map(function (n) {
                    return pushCall(stack, index, n, nestedNodeF);
                })
            };

            var params = node.getParameters();
            if (params.length() > 0) {
                base.parameters = params.map(function (p) {
                    return p.getName().toString();
                });
            }

            if (!index[joinId(node.getScopeId())].getIsGeneric())
                base.hash = joinId(node.getId());
        }

        if (struct.getDiscriminantCount() > 0) {
            // Existence of `discriminantOffset` => union semantics.
            base.discriminantOffset = struct.getDiscriminantOffset();
        }

        base = merge(base, {
            dataWordCount : struct.getDataWordCount(),
            pointerCount : struct.getPointerCount(),
            preferredListEncoding : struct.getPreferredListEncoding(),
            discriminantCount : struct.getDiscriminantCount(),
            fields : struct.getFields().map(function (f) {
                return pushCall(stack, index, f, fieldF);
            })
        });

        return base;
    };

    var brandF = function (stack, index) {
        function defaultChild(id) {
            var params = index[id].getParameters();
            var child = { id : id };

            var parent = index[joinId(index[id].getScopeId())];
            parent.getNestedNodes().forEach(function (nn) {
                if (joinId(nn.getId()) === id)
                    child.name = nn.getName().toString();
            });
            if (child.name === undefined)
                throw new Error('Child name not found');

            if (params.length() > 0) {
                child.parameters = params.map(function (p) {
                    return { type : "AnyPointer" };
                });
            }

            return child;
        }

        var id;
        var brand = stack.pop();
        id = joinId(top(stack).getTypeId());
        stack.push(brand);

        if (!index[id].getIsGeneric()) return { id : id, hash : id };

        /*
         * Accumulate the full specialization chain with AnyPointer
         * parametrizations.
         */
        var hash = {};
        hash[id] = 0;
        var specials = [defaultChild(id)];
        id = joinId(index[id].getScopeId());
        while (index[id].getIsGeneric()) {
            hash[id] = specials.length;
            specials.push(defaultChild(id));
            id = joinId(index[id].getScopeId());
        }

        /*
         * For any spec'd bindings, override the specialization chain's
         * AnyPointer default(s).  The existence of an `inherit` scope implies
         * nonrooted.
         */
        var base = null;
        brand.getScopes().forEach(function (s) {
            id = joinId(s.getScopeId());
            if (s.isBind()) {
                s.getBind().forEach(function (b, i) {
                    var param;
                    if (b.isType()) {
                        param = pushCall(stack, index, b.getType(), typeF);
                        specials[hash[id]].parameters[i] = param;
                    }
                });
            } else if (s.isInherit()) {
                if (base === null)
                    base = hash[id];
                else
                    base = Math.min(base, hash[i]);
            }
        });

        function getScopeHash(s) {
            if (s.parameters) {
                var params = s.parameters.map(function (p) {
                    return p.hash === undefined ? null : '(' + p.hash + ')';
                });

                if (params.indexOf(null) === -1)
                    return s.id + '|' + params.join('|');
                else
                    return null;
            } else {
                return s.id;
            }
        }

        var scope = {};
        if (base === null) {
            scope.scopeDistance = null;

            specials = specials.reverse();
            for (var i=0; i<specials.length; ++i) {
                var hashes = specials.slice(0, i+1).map(getScopeHash);
                if (hashes.indexOf(null) === -1)
                    specials[i].hash = hashes.join(':');
            }

            scope.path = specials;
        } else {
            id = currentScopeId(stack);

            scope.scopeDistance = 0;
            while (id !== specials[base].id) {
                scope.scopeDistance += 1;
                id = joinId(index[id].getScopeId());
            }

            scope.path = specials.slice(0, base).reverse();
        }

        // `scopeDistance` of non-null => inherits scope.
        return { generic : scope };
    };

    var typeF = function (stack, index) {
        var type = top(stack);

        var t;
        switch (type.which()) {
        case type.VOID: return { type : "Void", hash : "V" };
        case type.BOOL: return { type : "Bool", hash : "B" };
        case type.INT8: return { type : "Int8", hash : "I1" };
        case type.INT16: return { type : "Int16", hash : "I2" };
        case type.INT32: return { type : "Int32", hash : "I4" };
        case type.INT64: return { type : "Int64", hash : "I8" };
        case type.UINT8: return { type : "UInt8", hash : "U1" };
        case type.UINT16: return { type : "UInt16", hash : "U2" };
        case type.UINT32: return { type : "UInt32", hash : "U4" };
        case type.UINT64: return { type : "UInt64", hash : "U8" };
        case type.FLOAT32: return { type : "Float32", hash : "F4" };
        case type.FLOAT64: return { type : "Float64", hash : "F8" };
        case type.DATA: return { type : "Data", hash : "D" };
        case type.TEXT: return { type : "Text", hash : "T" };

        case type.ANY_POINTER:
            t = type.getAnyPointer();
            switch (t.which()) {
            case t.UNCONSTRAINED: return { type : "AnyPointer", hash : "A" };

            case t.PARAMETER:
                t = t.getParameter();

                var soughtId = joinId(t.getScopeId());
                var scopeId = currentScopeId(stack);
                t = {
                    scopeDistance : 0,
                    position : t.getParameterIndex()
                };
                while (scopeId != soughtId) {
                    t.scopeDistance += 1;
                    scopeId = joinId(index[scopeId].getScopeId());
                }

                return {
                    meta : "parameter",
                    type : t
                };

            case t.IMPLICIT_METHOD_PARAMETER: return { type : "AnyPointer" };
            }

            throw new Error();

        case type.ENUM:
            t = type.getEnum();
            stack.push(t);
            t = merge(
                { meta : "enum" },
                pushCall(stack, index, t.getBrand(), brandF)
            );
            stack.pop();

            return t;

        case type.LIST:
            var child = pushCall(
                stack,
                index,
                type.getList().getElementType(),
                typeF
            );

            t = {
                meta : "list",
                type : child.meta === undefined ? child.type : child
            };

            if (child.hash)
                t.hash = 'L|' + child.hash;

            return t;

        case type.STRUCT:
            t = type.getStruct();
            stack.push(t);
            t = merge(
                { meta : "struct" },
                pushCall(stack, index, t.getBrand(), brandF)
            );
            stack.pop();

            return t;

        case type.INTERFACE:
            t = t.getInterface();
            stack.push(t);
            t = merge(
                { meta : "interface" },
                pushCall(stack, index, t.getBrand(), brandF)
            );
            stack.pop();

            return t;

        default: throw new Error();
        }
    };

    var defaultValueF = function (stack, index) {
        var v = top(stack);

        function defaultize(value) {
            return { defaultValue : value };
        }

        var zero = defaultize("AAAAAAAAAAA=");
        var value, data;

        switch (v.which()) {
        case v.VOID: return defaultize(v.getVoid());
        case v.BOOL: return defaultize(v.getBool() >>> 0);
        case v.INT8: return defaultize(v.getInt8());
        case v.INT16: return defaultize(v.getInt16());
        case v.INT32: return defaultize(v.getInt32());
        case v.INT64: return defaultize(v.getInt64());
        case v.UINT8: return defaultize(v.getUint8());
        case v.UINT16: return defaultize(v.getUint16());
        case v.UINT32: return defaultize(v.getUint32());
        case v.UINT64: return defaultize(v.getUint64());
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

        case v.ENUM: return {defaultValue : v.getEnum() };
        case v.DATA:
            value = v.getData();
            return v.hasData() ? defaultize(encodeBlobType(value)) : zero;

        case v.TEXT:
            value = v.getText();
            return v.hasText() ? defaultize(encodeBlobType(value)) : zero;

        case v.ANY_POINTER:
            value = v.getAnyPointer();
            return v.hasAnyPointer() ? defaultize(encodeAny(value)) : zero;

        case v.LIST:
            value = v.getList();
            return v.hasList() ? defaultize(encodeAny(value)) : zero;

        case v.STRUCT:
            value = v.getStruct();
            return v.hasStruct() ? defaultize(encodeAny(value)) : zero;

        case v.INTERFACE: throw new Error('Interfaces are not supported');

        default: throw new Error('Unrecognized value type: '+v.which());
        }
    };

    var valueF = function (stack, index) {
        var v = top(stack);

        function valueize(value) {
            return { value : value };
        }

        var value, data;
        switch (v.which()) {
        case v.VOID: return valueize(v.getVoid());
        case v.BOOL: return valueize(v.getBool() | 0);
        case v.INT8: return valueize(v.getInt8());
        case v.INT16: return valueize(v.getInt16());
        case v.INT32: return valueize(v.getInt32());
        case v.INT64: return valueize(v.getInt64());
        case v.UINT8: return valueize(v.getUint8());
        case v.UINT16: return valueize(v.getUint16());
        case v.UINT32: return valueize(v.getUint32());
        case v.UINT64: return valueize(v.getUint64());
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

        case v.ENUM: return valueize(v.getEnum());
        case v.DATA: return valueize(encodeBlobType(v.getData()));
        case v.TEXT: return valueize(encodeBlobType(v.getText()));
        case v.ANY_POINTER: return valueize(encodeAny(v.getAnyPointer()));
        case v.LIST: return valueize(encodeAny(v.getList()));
        case v.STRUCT: return valueize(encodeAny(v.getStruct()));
        case v.INTERFACE: throw new Error('Interfaces are not supported');

        default: throw new Error('Unrecognized value type: '+v.which());
        }
    };

    var nestedNodeF = function (stack, index) {
        var base = {
            name : top(stack).getName().toString()
        };

        var node = index[joinId(top(stack).getId())];

        switch (node.which()) {
        case node.FILE:
            throw new Error('Unanticipated: File node nested within another node');

        case node.STRUCT:
            return merge(base, pushCall(stack, index, node, structureF));

        case node.ENUM:
            return merge(base, pushCall(stack, index, node, enumerationF));

        case node.INTERFACE:
            throw new Error('Interfaces are not supported (yet)');

        case node.CONST:
            return merge(base, pushCall(stack, index, node, constantF));

        case node.ANNOTATION:
            return merge(base, pushCall(stack, index, node, annotationF));

        default: throw new Error();
        }
    };

    return nestedNodeF;
});
