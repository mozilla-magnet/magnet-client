
/**
 * Dependencies
 */

var ReactNative = require('react-native');
var App = require('./lib/views/app');
var React = require('react');

var {
  UIManager,
  AppRegistry
} = ReactNative;

class AndroidApp extends React.Component {
  render() {
    return <App/>;
  }
}

// layout-animations are turned off on android by default
UIManager.setLayoutAnimationEnabledExperimental(true);

AppRegistry.registerComponent('Magnet', () => AndroidApp);
