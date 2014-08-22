define([], function () {

    var F = function (obj) {
        for (var key in obj) {
            this[key] = obj[key];
        }
    };

    F.prototype.merge = function (obj) {
        for (var key in obj) {
            this[key] = obj[key];
        }

        return this;
    };

    return F;
});
