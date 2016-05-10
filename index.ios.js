
/**
 * Dependencies
 */

var ReactNative = require('react-native');
var App = require('./lib/views/app');
var React = require('react');

var { AppRegistry } = ReactNative;

class IOSApp extends React.Component {
  render() {
    return (
      <App style={{paddingTop: 20}}/>
    );
  }
}

AppRegistry.registerComponent('Magnet', () => IOSApp);
