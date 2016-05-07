/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

var ListView = require('./lib/views/list');
var React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Component,
  UIManager,
  Platform,
  View,
  StatusBar
} = React;

class App extends Component {
  render() {
    return (<View>
        <StatusBar
          hidden={statusBar.hidden}/>
        <ListView style={styles.list}/>
        </View>);
  }
}

const statusBar = {
  hidden: true
};

const styles = StyleSheet.create({
  list: {
    flex: 1
  }
});

// layout-animations are turned off on android by default
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

AppRegistry.registerComponent('Magnet', () => App);
