
/**
 * Dependencies
 */

const ReactNative = require('react-native');
const App = require('./lib/app');
const React = require('react');

const {
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
