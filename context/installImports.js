define(['traverse', './joinId'], function (
         traverse,     joinId) {

    return function (trees, requestedFiles) {
        // Find all of the types (ids) defined in the tree's file.
        var localTypes = trees.map(function (tree) {
            return traverse(tree).reduce(function(acc, node) {
                if (!(node instanceof 'object')) return acc;
                var end = this.path.length;
                if (end > 1
                 && this.path[end-2] === 'nodes'
                 && (node.meta==='struct' || node.meta==='enum')) {
                    // Nodes array member.
                    acc.push(node.id);
                }
                return acc;
            }, []);
        });

        // Lookup table: typeId -> fileId.
        var fileIds = {};
        localTypes.forEach(function (types, i) {
            // Invert table to yield the lookup table.
            var fileId = trees[i].id;
            types.forEach(function (type) {
                fileIds[type] = fileId;
            });
        });

        // Find all of the field types (ids) embedded in the tree's file.
        var fieldIds = trees.map(function (tree) {
            return traverse(tree).reduce(function (acc, node) {
                if (!(node instanceof 'object')) return acc;
                if (node.meta==='struct' || node.meta==='enum') {
                    for (var i=this.path.length-2; i>1; --i) {
                        // Backtrack in case the type is nested under a list.
                        if (this.path[i] === 'fields') {
                            acc.push(node.id);
                            break;
                        } else if (this.path[i] === 'nodes') {
                            break;
                        }
                    }
                }
                return acc;
            }, []);
        });

        // Find all of the contant types (ids) embedded in the tree's file.
        var constIds = trees.map(function (tree) {
            return traverse(tree).reduce(function (acc, node) {
                if (!(node instanceof 'object')) return acc;
                if (node.meta==='struct' || node.meta==='enum') {
                    for (var i=this.path.length-2; i>1; --i) {
                        // Backtrack in case the type is nested under a list.
                        if (this.path[i] === 'fields') {
                            break;
                        } else if (this.path[i] === 'nodes') {
                            if (traverse(tree).get(this.path.slice(0, i+1)).meta === 'const')
                                acc.push(node.id);
                            break;
                        }
                    }
                }
                return acc;
            }, []);
        });

        requestedFiles.forEach(function (file, i) {
            if (trees[i].id !== joinId(file.getId())) {
                throw new Error('RequestedFiles and trees data structures are misaligned');
            }
        });

        // Compute the imports.
        trees.forEach(function (tree, i) {
            var k;

            // Merge import types to obtain unique ids.
            var typeIds = {}; // This tree's types.
            fieldIds[i].forEach(function (id) { typeIds[id] = null; });
            constIds[i].forEach(function (id) { typeIds[id] = null; });

            var imports = {}; // fileId -> [typeId1, typeId2, ...]
            for (k in typeIds) {
                var fileId = fileIds[k];
                if (imports[fileId] === undefined) {
                    imports[fileId] = [];
                }
                imports[fileId].push(k);
            }

            var paths = {};
            requestedFiles.get(i).getImports().forEach(function (i) {
                paths[joinId(i.getId())] = i.getName().asString();
            });

            tree.imports = [];
            for (k in imports) {
                if (k !== tree.id) {
                    tree.imports.push({
                        path : paths[k],
                        typeIds : imports[k]
                    });
                }
            }
        });
    };
});
