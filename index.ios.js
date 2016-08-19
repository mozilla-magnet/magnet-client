
/**
 * Dependencies
 */

var ReactNative = require('react-native');
var Provider = require('./lib/provider');
var theme = require('./config').theme;
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
        <Provider/>
      </View>
    );
  }
}

AppRegistry.registerComponent('Magnet', () => IOSApp);
