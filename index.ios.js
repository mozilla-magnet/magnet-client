var ListView = require('./lib/views/list');
var React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Component,
  View,
  StatusBar
} = React;

class App extends Component {
  render() {
    return  (
      <View style={styles.container}>
        <ListView style={styles.list}/>
      </View>);
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f2f2f2'
  }
});

AppRegistry.registerComponent('Magnet', () => App);
