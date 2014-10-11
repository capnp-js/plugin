define(['./node', './joinId'], function (
           node,     joinId) {

    return function (requestedFile, nodes) {
        var index = {};
        nodes.forEach(function (n) { index[joinId(n.getId())] = n; });

        var id = joinId(requestedFile.getId());

        var children = index[id].getNestedNodes().map(function (c) {
            return node(c, index);
        });

        return {
            name : requestedFile.getFilename().asString(),
            meta : "file",
            id : id,
            nodes : children
        };
    };
});
