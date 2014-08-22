define(['./Fragment'], function (F) {

    return function (t, index) {
        if (t.isVoid()) {
            return new F({ type : "Void" });

        } else if (t.isBool()) {
            return new F({ type : "Bool" });

        } else if (t.isInt8()) {
            return new F({ type : "Int8" });

        } else if (t.isInt16()) {
            return new F({ type : "Int16" });

        } else if (t.isInt32()) {
            return new F({ type : "Int32" });

        } else if (t.isInt64()) {
            return new F({ type : "Int64" });

        } else if (t.isUint8()) {
            return new F({ type : "UInt8" });

        } else if (t.isUint16()) {
            return new F({ type : "UInt16" });

        } else if (t.isUint32()) {
            return new F({ type : "UInt32" });

        } else if (t.isUint64()) {
            return new F({ type : "UInt64" });

        } else if (t.isFloat32()) {
            return new F({ type : "Float32" });

        } else if (t.isFloat64()) {
            return new F({ type : "Float64" });

        } else if (t.isData()) {
            return new F({ type : "Data" });

        } else if (t.isText()) {
            return new F({ type : "Text" });

        } else if (t.isEnum()) {
            return new F({ type : "enum" });

        } else if (t.isAnyPointer()) {
            return new F({ type : "AnyPointer" });

        } else if (t.isList()) {
            return new F({
                meta : "list",
                type : typeF(t.getList().getElementType())
            });

        } else if (t.isStruct()) {
            return new F({
                meta : "struct",
                id : t.getStruct().getTypeId()
            });

        } else if (t.isInterface()) {
            return new F({
                meta : "interface",
                id : t.getInterface().getTypeId()
            });

        } else {
            throw new Error();
        }
    };
});
