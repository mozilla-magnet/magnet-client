const staticConfig = require('./config.json');

module.exports = Object.assign(
  getEnvironmentConfig(),
  staticConfig,
  {}
);

/*
 * Helpers
 */
function asCamelCase(key) {
  const [first, ...parts] = key.split('_');

  return parts
    .reduce((built, next) => {
      // Make lower case, and upper case first letter
      const lowered = next.toLowerCase();
      return built + lowered[0].toUpperCase() + lowered.slice(1);
    }, first.toLowerCase());
}

function getEnvironmentConfig() {
  return Object.keys(process.env).reduce((vars, key) => {
    if (key.startsWith('MAGNET_')) {
      const camelCaseKey = asCamelCase(key.replace('MAGNET_', ''));
      vars[camelCaseKey] = process.env[key];
    }

    return vars;
  }, {});
}
