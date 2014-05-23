var List = require('./List');

var Data = function () {};

Data.prototype = Object.create(List.prototype);

module.exports = Data;
