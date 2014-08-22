define(['./Fragment', './structure', './valueF', './typeF'], function (
           F,            structure,     valueF,     typeF) {

    var slotF = function (slot, index) {
        var s = new F({
            offset : slot.getOffset(),
            hadExplicitDefault : slot.getHadExplicitDefault()
        });

        s.defaultValue = valueF(slot.getValue(), index).value;
        s.merge(typeF(slot.getType()));

        return s;
    };

    var groupF = function (group, index) {
        return structure(index[group.getTypeId()], index);
    };

    return function (field, index) {
        if (field.isSlot()) {
            return slotF(field.getSlot(), index);

        } else if (field.isGroup()) {
            return groupF(field.getGroup());

        } else { throw new Error(); }
    };
});
