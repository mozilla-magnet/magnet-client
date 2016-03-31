
module.exports = (name, enabled) => {
  return (...args) => {
    if (enabled) console.log(`[${name}]`, ...args);
  }
}
