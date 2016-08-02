
/**
 * Dependencies
 */

var ReactNative = require('react-native');
var theme = require('./config').theme;
var App = require('./lib/app');
var React = require('react');

var {
  AppRegistry,
  View
} = ReactNative;

class IOSApp extends React.Component {
  render() {
    return (
      <View style={{
        backgroundColor: theme.colorBackground,
        paddingTop: 20,
        flex: 1
        }}>
        <App/>
      </View>
    );
  }
}

AppRegistry.registerComponent('Magnet', () => IOSApp);
