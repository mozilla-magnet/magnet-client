
/**
 * Dependencies
 */

const babelConfig = require('../package.json').babel;
const register = require('babel-core/register');
const chaiEnzyme = require('chai-enzyme');
const path = require('path');
const chai = require('chai');
const fs = require('fs');

// only babel transpile these node_modules:
const modulesToCompile = [
  'react-native',
  'react-native-mock'
].map((moduleName) => new RegExp(`/node_modules/${moduleName}`));

babelConfig.ignore = function(filename) {
  if (!(/\/node_modules\//).test(filename)) return false;
  const matches = modulesToCompile.filter((regex) => regex.test(filename));
  return matches.length === 0;
}

register(babelConfig);

// setup globals / chai
global.__DEV__ = true;
global.expect = chai.expect;
chai.use(chaiEnzyme());

// setup mocks
require('react-native-mock/mock');
const React = require('react-native')

// add modules missing from react-native-mock
React.Alert = { alert: React.View };
React.UIManager.setLayoutAnimationEnabledExperimental = () => {};
React.NavigationExperimental = {
  AnimatedView: React.View
};

/**
 * HACK: support .android.js and .ios.js
 * in Node test runner environment.
 */

var Module = require('module');
var originalRequire = Module.prototype.require;
var platform = process.env.PLATFORM || 'ios';

Module.prototype.require = function(pathname){
  try {
    return originalRequire.apply(this, arguments);
  } catch(e) {
    if (e.code != 'MODULE_NOT_FOUND') throw e;
    var dir = path.parse(this.filename).dir;
    var absolute = path.join(dir, pathname);
    var newPath = createPlatformPath(pathname, absolute);
    if (!isFile(newPath)) throw e;
    return originalRequire.call(this, newPath);
  }
};

function createPlatformPath(pathname, absolute) {
  if (isDir(absolute)) absolute += '/index';
  if (absolute.endsWith('..')) absolute += '/';
  if (absolute.endsWith('/')) absolute += 'index';
  return path.normalize(`${absolute}.${platform}.js`);
}

function isDir(pathname) {
  try {
    return fs.statSync(pathname).isDirectory();
  } catch(e) { return false; }
}

function isFile(pathname) {
  try {
    return fs.statSync(pathname).isFile();
  } catch(e) { return false; }
}
