define(['capnp-js/stringify', './Fragment'], function (stringify, F) {

    return function (v, index) {
        if (t.isVoid()) {
            return new F({ value : v.getVoid() });

        } else if (t.isBool()) {
            return new F({ value : v.getBool() });

        } else if (t.isInt8()) {
            return new F({ value : v.getInt8() });

        } else if (t.isInt16()) {
            return new F({ value : v.getInt16() });

        } else if (t.isInt32()) {
            return new F({ value : v.getInt32() });

        } else if (t.isInt64()) {
            return new F({ value : v.getInt64() });

        } else if (t.isUint8()) {
            return new F({ value : v.getUint8() });

        } else if (t.isUint16()) {
            return new F({ value : v.getUint16() });

        } else if (t.isUint32()) {
            return new F({ value : v.getUint32() });

        } else if (t.isUint64()) {
            return new F({ value : v.getUint64() });

        } else if (t.isFloat32()) {
            return new F({ value : v.getFloat32() });

        } else if (t.isFloat64()) {
            return new F({ value : v.getFloat64() });

        } else if (t.isData()) {
            return new F({ value : v.getData() });

        } else if (t.isText()) {
            return new F({ value : v.getText() });

        } else if (t.isEnum()) {
            return new F({ value : v.getEnum() });

        } else if (t.isAnyPointer()) {
            return new F({ value : stringify.toBase64(v.getAnyPointer()) }); // dual to toUint8Array

        } else if (t.isList()) {
            return new F({ value : stringify.toBase64(v.getList()) });

        } else if (t.isStruct()) {
            return new F({ value : stringify.toBase64(v.getStruct()) });

        } else if (t.isInterface()) {
            return new F({ value : t.getInterface() });

        } else {
            throw new Error();
        }
    };
});
