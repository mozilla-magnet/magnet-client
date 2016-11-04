
/**
 * Dependencies
 */

const ReactNative = require('react-native');
const Provider = require('./lib/provider');
const React = require('react');

const {
  UIManager,
  AppRegistry,
} = ReactNative;

class AndroidApp extends React.Component {
  render() {
    return <Provider/>;
  }
}

// layout-animations are turned off on android by default
UIManager.setLayoutAnimationEnabledExperimental(true);

AppRegistry.registerComponent('Magnet', () => AndroidApp);
