define(['./Fragment', './joinId'], function (F, joinId) {

    var enumerant = function (node, index) {
        return new F({ name : node.getName() });
    };

    return function (node, index) {
        var enumerants = [];
        var list = node.getEnumerants();
        for (var i=0; i<enumerants.length(); ++i) {
            enumerants.push(enumerant(list.get(i), index));
        }

        return new F({
            meta : "enum",
            id : joinId(node.getId()),
            enumerants : enumerants
        });
    };
});
