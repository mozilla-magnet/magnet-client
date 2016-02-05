
module.exports = function(name, on) {
 return on ? console.log.bind(console, '[' + name + ']') : function() {};
};
