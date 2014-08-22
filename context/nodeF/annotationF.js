define(['./Fragment'], function (F) {

    return function (node, index) {
        return new F({ meta : "annotation" });
    };
});
