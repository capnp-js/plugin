define(['./node', './joinId', './imports'], function (
           node,     joinId,     imports) {

    return function (requestedFiles, nodes) {
        var is = imports(requestedFiles, nodes);

        var trees = [];
        requestedFiles.forEach(function (file) {
            var index = {};
            nodes.forEach(function (n) { index[joinId(n.getId())] = n; });

            var id = joinId(file.getId());

            var children = index[id].getNestedNodes().map(function (c) {
                return node(c, index);
            });

            trees.push({
                name : file.getFilename().asString(),
                meta : "file",
                imports : is[id],
                id : id,
                nodes : children
            });
        });

        return trees;
    };
});
