define(['./nodeF', './nodeF/joinId', './Fragment'], function (
           nodeF,           joinId,     F) {

    return function (requestedFile, nodes) {
        var i;
        var root = new F({
            name : requestedFile.getFilename(),
            meta : "file",
            id : joinId(requestedFile.getId()),
            imports : []
        });

        var imports = requestedFile.getImports();
        for (i=0; i<nodes.length(); ++i) {
            root.imports.push(imports.get(i).getName().asString();
        }

        var index = {};
        for (i=0; i<nodes.length(); ++i) {
            var node = nodes.get(i);
            index[joinId(node.getId())] = node;
        }

        root.nodes = [];
        var children = index[joinId(requestedFile.getId())].getNestedNodes();
        for (i=0; i<children.length(); ++i) {
            root.nodes.push(nodeF(children.get(i), index));
        }

        return root;
    };
});
