var ListView = require('./lib/views/list');
var React = require('react-native');

var {
  StyleSheet,
  Component,
  UIManager,
  AppRegistry
} = React;

class App extends Component {
  render() {
    return  <ListView style={styles.list}/>;
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1
  }
});

// layout-animations are turned off on android by default
UIManager.setLayoutAnimationEnabledExperimental(true);

AppRegistry.registerComponent('Magnet', () => App);
