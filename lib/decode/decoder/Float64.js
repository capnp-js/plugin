var buffer = new ArrayBuffer(8);
var view = new DataView(buffer);

module.exports = function (array, begin) {
    var i=7;
    do {
        buffer[i] = array[begin+i];
    } while (--i);

    return view.getFloat64(0, true);
};
