var List = require('./List');

var Text = function () {};

Text.prototype = Object.create(List.prototype);

module.exports = Text;
