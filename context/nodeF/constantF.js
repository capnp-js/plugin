define(['./Fragment', './typeF', './valueF', './joinId'], function (
           F,            typeF,     valueF,     joinId) {

    return function (node, index) {
        return new F({
            meta : "const",
            id : joinId(node.getId()),
            datum : {
                type : typeF(node.getType(), index),
                value : typeF(node.getType(), index)
            }
        });
    };
});
