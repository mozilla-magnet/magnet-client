'use strict';

/**
 * Dependencies
 */

var debug = require('../debug')('ContextMenu');
var ReactNative = require('react-native');
var React = require('react');

var {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  View,
  Animated
} = ReactNative;

class ContextMenu extends React.Component {
  constructor() {
    super(...arguments);

    this.onBackgroundPress = this.onBackgroundPress.bind(this);
    this.onItemPress = this.onItemPress.bind(this);

    this.state = {
      opacity: new Animated.Value(0)
    };
  }

  componentDidMount() {
    Animated.timing(this.state.opacity, {
      duration: 200,
      toValue: 1
    }).start();
  }

  close() {
    Animated.timing(this.state.opacity, {
      duration: 200,
      toValue: 0
    }).start(this.props.onClosed);
  }

  render() {

    // render list items
    var items = this.props.items.map((item, i) => {
      var style = [styles.item];
      if (i === 0) style.push(style.firstItem);

      return (
        <View style={style} key={item.text}>
          <TouchableOpacity
            style={styles.itemInner}
            onPress={() => this.onItemPress(item.callback)}>
              <Text style={styles.itemText}>{item.text}</Text>
          </TouchableOpacity>
        </View>
      );
    });

    return (
      <TouchableWithoutFeedback onPress={this.onBackgroundPress}>
        <Animated.View style={[styles.root, {
            opacity: this.state.opacity
          }]}
          >
          <View style={styles.list}>{items}</View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }

  onBackgroundPress() {
    this.close();
  }

  onItemPress(callback) {
    debug('on item press');
    callback();
    this.close();
  }
}

ContextMenu.propTypes = {
  items: React.PropTypes.array.isRequired,
  onClosed: React.PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    padding: 28,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center'
  },

  list: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#777'
  },

  item: {
    padding: 14,
    borderTopWidth: 1,
    borderColor: '#eee'
  },

  firstItem: {
    borderTopWidth: 0
  },

  itemInner: {
    alignItems: 'center'
  },

  itemText: {
    fontSize: 16,
    color: '#333'
  }
});

/**
 * Exports
 */

module.exports = ContextMenu;
