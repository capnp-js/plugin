module.exports = function Any(segments, segment, pointer) {
    this.__segments = segments;
    this.__segment = segment;
    this.__pointer = pointer;
};

Any.prototype.interpret(Type) {
    return Type.deref(this.__segments, this.__segment, this.__pointer);
}
