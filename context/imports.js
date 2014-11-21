define(['./joinId'], function (
           joinId) {

    var merge = function (target, source) {
        for (var k in source) {
            target[k] = source[k];
        }

        return target;
    };

    var localIds = function (index, root) {
        var types = {};

        root.getNestedNodes().forEach(function (node) {
            var id = joinId(node.getId());
            node = index[id];

            if (node.isStruct()) {
                types[id] = null;
                merge(types, localIds(index, node));
            } else if (node.isEnum()) {
                types[id] = null;
            }
        });

        return types;
    };

    var typeId = function (type) {
        var ids = {};

        if (type.isList()) {
            merge(ids, typeId(type.getList().getElementType()));
        } else if (type.isEnum()) {
            ids[joinId(type.getEnum().getTypeId())] = null;
        } else if (type.isStruct()) {
            ids[joinId(type.getStruct().getTypeId())] = null;
        }

        return ids;
    };

    var fieldIds = function (index, root) {
        if (root.isSlot()) {
            return typeId(root.getSlot().getType());
        } else if (root.isGroup()) {
            var node = index[joinId(root.getGroup().getTypeId())];
            var types = {};
            node.getStruct().getFields().forEach(function (field) {
                merge(types, fieldIds(index, field));
            });

            return types;
        }
    };

    var usedIds = function (index, root) {
        var types = {};

        root.getNestedNodes().forEach(function (node) {
            var id = joinId(node.getId());
            node = index[id];

            if (node.isStruct()) {
                node.getStruct().getFields().forEach(function (field) {
                    merge(types, fieldIds(index, field));
                });
                merge(types, usedIds(index, node));
            } else if (node.isEnum()) {
                types[joinId(node.getId())] = null;
            } else if (node.isConst()) {
                merge(types, typeId(node.getConst().getType()));
            }
        });

        return types;
    };

    return function (requestedFiles, nodes) {
        var index = {};
        nodes.forEach(function (node) {
            index[joinId(node.getId())] = node;
        });

        var fileIds = {}; // typeId -> fileId
        nodes.forEach(function (node) {
            if (node.isFile()) {
                var fileId = joinId(node.getId());
                for (var k in localIds(index, node)) {
                    fileIds[k] = fileId;
                }
            }
        });

        var usedTypes = {}; // fileId -> typeIds
        nodes.forEach(function (node) {
            if (node.isFile()) {
                var id = joinId(node.getId());
                usedTypes[id] = Object.keys(usedIds(index, node));
            }
        });

        var importers = {};
        requestedFiles.forEach(function (file) {
            var importPaths = {};
            file.getImports().forEach(function (i) {
                importPaths[joinId(i.getId())] = i.getName().toString();
            });

            var importerId = joinId(file.getId());

            var imports = {};
            usedTypes[importerId].forEach(function (typeId) {
                var parentFileId = fileIds[typeId];
                var filePath = importPaths[parentFileId];
                if (parentFileId !== importerId) {
                    if (imports[filePath] === undefined) {
                        imports[filePath] = [];
                    }
                    imports[filePath].push(typeId);
                }
            });

            importers[importerId] = [];
            for (var path in imports) {
                importers[importerId].push({
                    path : path,
                    typeIds : imports[path]
                });
            }
        });

        return importers;
    };
});
