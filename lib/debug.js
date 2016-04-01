
module.exports = (name, enabled) => {
  return function() {
    var string = arguments[0];
    var params = [].slice.call(arguments, 1);
    if (enabled) console.log(`[${name}] ${string}`, ...params);
  }
}
