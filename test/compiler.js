
/**
 * Dependencies
 */

var readFile = require('fs').readFileSync;
var old = require.extensions['.js'];
var babel = require('babel-core');

function compile(string) {
  return babel.transform(string, {
    babelrc: false,
    retainLines: true,
    plugins: [
      'transform-react-jsx',
      'transform-object-rest-spread'
    ]
  }).code;
}

require.extensions['.js'] = function(module, filename) {
  if (~filename.indexOf('node_modules')) return old(module, filename);
  var source = readFile(filename, 'utf8');
  var compiled = compile(source);
  return module._compile(compiled, filename);
};
