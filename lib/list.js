'use strict';

/**
 * Dependencies
 */

var debug = require('./debug')('List');
var ListItem = require('./list-item');
var React = require('react-native');
var Scanner = require('./scanner');

var {
  Component,
  StyleSheet,
  ScrollView,
  View
} = React;

class List extends Component {
  constructor() {
    super(...arguments);
    this.state = { items: [] };
    this.scanner = new Scanner(this.onItemFound.bind(this));

    // Finding something before react-native is
    // fully initialized can cause a crash:
    // https://github.com/walmartreact/react-native-orientation-listener/issues/8
    // TODO: This should be fixed inside NetworkScanner.java
    setTimeout(() => this.scanner.start(), 1000);
  }

  onItemFound(item) {
    this.addItem(item);
  }

  addItem(item) {
    debug('add item', item);
    var items = this.state.items.concat([item]);
    this.setState({ items: items });
  }

  render() {
    debug('render');
    var items = this.state.items.map(item => <ListItem {...item} key={item.id}/>);
    return <ScrollView style={styles.container}>
      <View style={styles.content}>{items}</View>
    </ScrollView>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2'
  },

  content: {
    padding: 14
  }
});

/**
 * Exports
 */

module.exports = List;
