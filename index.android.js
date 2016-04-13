/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import List from './lib/views/list';
import React from 'react-native';

var AppRegistry = React.AppRegistry;
var StyleSheet = React.StyleSheet;
var Component = React.Component;

class App extends Component {
  render() {
    return <List style={styles.list}/>;
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1
  }
});

AppRegistry.registerComponent('Magnet', () => App);
