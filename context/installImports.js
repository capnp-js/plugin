define(['path', 'traverse', 'lodash', './joinId'], function (
         path,   traverse,        _,     joinId) {

    var Path = function (requestedFiles, sourceId) {
        var files = {};
        requestedFiles.forEach(function (file) {
            var id = joinId(file.getId());
            files[id] = file.getImports();
        });
        this._sourceId = sourceId;
        this._files = files;
    };

    Path.prototype.find = function (targetId) {
        var visited = {};
        visited[this._sourceId] = null;
        var pending = [this._sourceId];
        var paths = [[]];

        while (pending.length > 0) {
            var id = pending.shift();
            var p = paths.shift();
            if (id === targetId) {
                var i = _.findLastIndex(p, function (part) {
                    return part[0]==='/' || part[0]==='\\';
                });
                if (i === -1) {
                    // Local path
                    return path.join.apply(null, p);
                } else {
                    // Grab the last absolute path.
                    return path.join.apply(null, p.slice(i));
                }
            }
            this._files[id].forEach(function (i) {
                if (visited[joinId(i.getId())] === undefined) {
                    visited[joinId(i.getId())] = null;
                    pending.push(joinId(i.getId()));
                    var next = p.slice();
                    next.push(i.getName().asString());
                    paths.push(next);
                }
            }.bind(this));
        }

        throw new Error('Target not found');
    };

    return function (trees, requestedFiles) {
        // Find all of the types (ids) defined in the tree's file.
        var localTypes = trees.map(function (tree) {
            return traverse(tree).reduce(function(acc, node) {
                if (typeof node !== 'object') return acc;
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
                if (typeof node !== 'object') return acc;
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
                if (typeof node !== 'object') return acc;
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

        // Compute the imports.
        trees.forEach(function (tree, i) {
            var k;

            // Merge import types to obtain unique ids.
            var typeIds = {}; 
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

            tree.imports = [];
            for (k in imports) {
                var p = new Path(requestedFiles, tree.id);
                if (k !== tree.id) {
                    tree.imports.push({
                        path : p.find(k),
                        typeIds : imports[k]
                    });
                }
            }
        });
    };
});
