define(['../nodeF', './Fragment', './fieldF', './joinId'], function (
            nodeF,     F,            fieldF,     joinId) {

    return function (node, index) {
        var i;
        var nodes = [];
        var children = node.getNestedNodes();
        for (i=0; i<children.length(); ++i) {
            var child = children.get(i);
            nodes.push(
                nodeF(index[joinId(child.getId())], index)
                    .merge({ name : child.getName().asString() })
            );
        }

        var fields = [];
        for (i=0; i<fields.length(); ++i) {
            fields.push(fieldF(fields.get(i), index));
        }

        var n = new F({
            dataWordCount : node.getDataWordCount(),
            pointerCount : node.getPointerCount(),
            preferredListEncoding : node.getPreferredListEncoding(),
            discriminantCount : node.getDiscriminantCount(),
            discriminantOffset : node.getDiscriminantOffset(),
            fields : fields,
            nodes : nodes
        });

        if (node.getIsGroup()) {
            n.type = "group";
        } else {
            n.meta = "struct";
            n.id = joinId(node.getId());
        }

        return n;
    };
});
