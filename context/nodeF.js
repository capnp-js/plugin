define(['./structureF', './enumerationF', './constantF', './annotationF'], function (
           structureF,     enumerationF,     constantF,     annotationF) {

    return function (node, index) {
        var name = { name : node.getName() };

        if (node.isFile()) {
            throw new Error('Unanticipated layout');

        } else if (node.isStruct()) {
            return structureF(node, index).merge(name);

        } else if (node.isEnum()) {
            return enumerationF(node, index).merge(name);
            
        } else if (node.isInterface()) {
            throw new Error('Interfaces are not supported (yet)');

        } else if (node.isConst()) {
            return constantF(node, index).merge(name);
            
        } else if (node.isAnnotation()) {
            return annotationF(node, index).merge(name);

        } else {
            throw new Error();
        }
    };
});
