
/**
 * Dependencies
 */

const replace = require('module-replace')({ root: __dirname });
const chaiEnzyme = require('chai-enzyme');
const sinon = require('sinon');
const chai = require('chai');

/**
 * Defines which platform specific
 * files are loaded for testing.
 *
 * @type {String}
 */
var platform = process.env.PLATFORM || 'ios';

/**
 * Chai setup
 */

global.expect = chai.expect;
chai.use(chaiEnzyme());

/**
 * Module replacements
 */

replace
  .module('react-native')
  .with('react-native-mock/build/react-native');

replace
  .module('NativeMethodsMixin')
  .with('./mocks/NativeMethodsMixin');

replace
  .module('../lib/views/spinner/index')
  .with(`../lib/views/spinner/index.${platform}`);


/**
 * Required for react-native
 *
 * @type {Boolean}
 */
global.__DEV__ = true;

/**
 * React Native setup
 */

const ReactNative = require('react-native')

// add modules missing from reactNative-native-mock
ReactNative.Alert = { alert: ReactNative.View };
ReactNative.UIManager.setLayoutAnimationEnabledExperimental = () => {};

// override as default mock seems broken
ReactNative.Animated.decay = function() {
  this.decay._start = sinon.stub()
  return { start: this.decay._start };
}

// override as default mock seems broken
ReactNative.Animated.timing = function() {
  this.timing._start = sinon.stub()
  return { start: this.timing._start };
}

ReactNative.PanResponder = {
  create: config => {
    return { panHandlers: config }
  }
};

ReactNative.findNodeHandle = function() {
  return {}
};

ReactNative.UIManager.configureNextLayoutAnimation = function(config, callback) {
  callback();
};
