exports.Void = {
    bits : 0,
    listEncoding : 0,
    template : 'void'
};
exports.Bool = {
    bits : 1,
    listEncoding : 1,
    template : 'boolean'
};
exports.Int8 = {
    bits : 8,
    listEncoding : 2,
    template : 'primitive',
};
exports.Int16 = {
    bits : 16,
    listEncoding : 3,
    template : 'primitive',
};
exports.Int32 = {
    bits : 32,
    listEncoding : 4,
    template : 'primitive',
};
exports.Int64 = {
    bits : 64,
    listEncoding : 5,
    template : 'primitive',
};
exports.UInt8 = {
    bits : 8,
    listEncoding : 2,
    template : 'primitive',
};
exports.UInt16 = {
    bits : 16,
    listEncoding : 3,
    template : 'primitive',
};
exports.UInt32 = {
    bits : 32,
    listEncoding : 4,
    template : 'primitive',
};
exports.UInt64 = {
    bits : 64,
    listEncoding : 5,
    template : 'primitive',
};
exports.Float32 = {
    bits : 32,
    listEncoding : 4,
    template : 'primitive',
};
exports.Float64 = {
    bits : 64,
    listEncoding : 5,
    template : 'primitive',
};
exports.Enum = {
    bits : 16,
    listEncoding : 3,
    template : 'primitive',
};

exports.Text = {
    template : 'pointer',
    listEncoding : 8,
    runtimeDS : 'Text'
};
exports.Data = {
    template : 'pointer',
    listEncoding : 8,
    runtimeDS : 'Data'
};
exports.List = {
    template : 'pointer',
    listEncoding : 8,
    runtimeDS : 'List'
};
exports.AnyPointer = {
    template : 'pointer',
    listEncoding : 8,
//    runtimeDS : 'AnyPointer'
};

exports.Struct = {
    template : 'struct',
    listEncoding : 8,
    preferredListEncoding : dynamic,
//    runtimeDS : 'Struct' // set runtimeDS programmatically during JSON prep
};
exports.Interface = {
    template : 'interface',
    listEncoding : 8,
//    runtimeDS : 'Interface' // base class
};
