define([], function () {

    var zeros = "00000000";

    return function (id) {
        var hi = id[0].toString(16);
        var lo = id[1].toString(16);

        return "0x" + hi + zeros.substring(0, 8-lo.length) + lo;
    };
});
