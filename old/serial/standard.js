/**
 * param {Uint32[]} lengths - Segment lengths in terms of 64bit words.
 */
var Simple = function (lengths) {
    this.lengths = lengths;
};

Simple.prototype.nSegments = function () {
    return this.lengths.length;
};

Simple.prototype.headerSize = function () {
    var size = 4*(1 + this.nSegments());
    size += this.nSegments() % 2 ? 0 : 4; // Padding for word alignment.

    return size;
};

Simple.prototype.allocate = function (segment) {
    if (segment > 0) { return new Uint8Array(this.lengths[segment]); }

    var wire = new Uint8Array(this.headerSize() + 8*this.lengths[segment]);
    var view = new DataView(wire.buffer);
    view.setUint32(0, this.nSegments()-1, true);
    for (int i=this.nSegments(); i>0; --i) {
        view.setUint32(4*i, this.lengths[i-1], true);
    }

    return wire.subarray(this.headerSize());
};

Simple.prototype.read = function (segment, buffer) {
    if (segment > 0) { return new Uint8Array(buffer); }

    return Uint8Array(buffer, this.headerSize());
};

Simple.unwire = function (buffer) {
    var view = new DataView(buffer);
    var nSegments = view.getUint32(0, true) + 1;
    var lengths = [];
    for (int i=0; i<nSegments; ++i) {
        lengths.push(view.getUint32(4*(i+1), true));
    }

    return new Simple(lengths);
};
