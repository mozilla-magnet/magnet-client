
/**
 * Dependencies
 */

const debug = require('../debug')('MenuScene');
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const React = require('react');

const {
  TouchableOpacity,
  StyleSheet,
  Image,
  View,
  Text,
} = ReactNative;

class ListScene extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    debug('render');

    return (
      <View style={styles.root}>
        <View>
          <TouchableOpacity
            testId="close-button"
            style={styles.close}
            onPress={this.onClosePress.bind(this)}>
            <Image
              style={styles.closeImage}
              source={require('../images/header-bar-close.png')}/>
          </TouchableOpacity>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>About Magnet</Text>
        </View>
        <View style={styles.separator}/>
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>Terms & Conditions</Text>
        </View>
        <View style={styles.separator}/>
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>Privacy Policy</Text>
        </View>
      </View>
    );
  }

  onRefresh() {}
  onItemSwiped() {}
  onClosePress() {
    this.props.navigator.pop();
  }
}

ListScene.propTypes = {
  navigator: React.PropTypes.object,
};

const mapStateToProps = function(store) {
  return { items: store.items };
}

/**
 * Exports
 */

module.exports = connect(mapStateToProps)(ListScene);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 7,
  },

  close: {
    padding: 7,
  },

  closeImage: {
    width: 20,
    height: 20,
  },

  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 7,
  },

  listItemText: {
    fontSize: 15
  },

  separator: {
    height: 1,
    backgroundColor: '#eee'
  }
});
