define([], function () {

    var zeros = '0000000000';

    return function (id) {
        var hi = id[0].toString();
        var lo = id[1].toString();

        return hi + zeros.substring(0, 10-lo.length) + lo;
    };
});
