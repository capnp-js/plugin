exports.Void = {
    bits : 0,
    template : 'void'
};
exports.Bool = {
    bits : 1,
    template : 'boolean'
};
exports.Int8 = {
    bits : 8,
    template : 'primitive',
};
exports.Int16 = {
    bits : 16,
    template : 'primitive',
};
exports.Int32 = {
    bits : 32,
    template : 'primitive',
};
exports.Int64 = {
    bits : 64,
    template : 'primitive',
};
exports.UInt8 = {
    bits : 8,
    template : 'primitive',
};
exports.UInt16 = {
    bits : 16,
    template : 'primitive',
};
exports.UInt32 = {
    bits : 32,
    template : 'primitive',
};
exports.UInt64 = {
    bits : 64,
    template : 'primitive',
};
exports.Float32 = {
    bits : 32,
    template : 'primitive',
};
exports.Float64 = {
    bits : 64,
    template : 'primitive',
};
exports.Enum = {
    bits : 16,
    template : 'primitive',
};

exports.Text = {
    template : 'pointer',
    runtimeDS : 'Text'
};
exports.Data = {
    template : 'pointer',
    runtimeDS : 'Data'
};
exports.List = {
    template : 'pointer',
    runtimeDS : 'List'
};
exports.AnyPointer = {
    template : 'pointer',
    runtimeDS : 'AnyPointer'
};

exports.Struct = {
    template : 'struct'
};
exports.Interface = {
    template : 'interface'
};
