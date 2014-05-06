/**
 * Offsets in bytes, not words.
 * @param {Uint8Array} p - pointer plus data.
 */

// Structs need to resolve to local name
// include('asdf') -> local path -> "var struct = require({includes=>structure=>require location});"

/**
 * Deep copies of nonroot objects that include intersegment pointers.
 * Copy part of a message into another message requires intersegment pointer handling.
 * C++ spec includes orphan concept, but it seems unuseful.
 * Attaching an object into an existing message seems more useful, but will require resolving intersegment pointers.
 */
// Segmentation strategy that puts intersegment pointer targets at the tail of segment admit coopting tree that contains no intersegment pointers itself


// Local handlers
// First couple of bits provide type
// AnyPointer -> Intersegment
// Specific Type -> Intersegment

// Parse tree determines if this is called instead of the more general AllPointer
// May be unresolvable at construction time.
// Read pointer at runtime => hop versus local (unresolved before first read)

module.exports.ListReader = function List(segments, segmentId, datum) {
    var segment = segments[segmentId];
    var pointer = segment.subarray(datum-8, datum);

    this.segments = segments;
    this.sid = sid;
    this.datum = datum;

    this.segments = segments;
    this.begin = {>list/offsetBytesIsNegative p='pointer'} ?
      datum - {>list/offsetBytes p='pointer'} :
      datum + {>list/offsetBytes p='pointer'};
    this.end = 

    switch ({>list/sizeEnum p='pointer'}) {
    case 1:
        
    case 2:
        this.end
        this._stride = 1; break;
    case 3:
        this._stride = 2; break;
    case 4:
        this._stride = 4; break;
    case 5:
    case 6:
        this._stride = 8; break;
    case 7:
        // I'm a little confused on the spec here: it says the start of the list
        // elements, not the memory blob, so that's what's implemented. This
        // comment is to ease debugging if my interpretation proves incorrect.
        var tag = segment.subarray(start-8, start);
        this._stride = 
        this._data = p.subarray(start, start + {>list/altBytes p='pointer'});
// cache sufficient information to seed struct on demand -- provide alternate main pointer, or static method?
        
        // Dust's configuration blob can be extended to contain some way to
        // resolve includes to their run time counterparts.

        this._data = p.subarray(start, start + {>list/cardinality p='p'}*1
        bytes[{>list/sizeEnum p='p'}]

ListReader.prototype.at = function 

ListReader.prototype.resolve = function () { return this; };

module.exports.Text = function Text(segment, fieldDatum) {};

Text.prototype.resolve = function () {};

module.exports.Data = function Data(segment, fieldDatum) {};

Data.prototype.resolve = function () {};

module.exports.Far = function Far(segment, fieldDatum) {};

Far.prototype.resolve = function () {
    // Attempt to lookup the pointer (requires segment availability)
    // If available, then memoize and return that henceforth.
    // Otherwise throw (two implementations warranted? -- if unavailable then return this)
};

module.exports.Capability = function Capability(segment, fieldDatum) {};

Capability.prototype.resolve = function () {};

var p = {
    0 : Struct,
    1 : List,
    2 : Far,
    3 : Capability
};

module.exports.AnyPointer = function AnyPointer(segment, fieldDatum) {
    var Type = p[pointer[0] & 0x00000003];
    return new Type(pointer);
};
