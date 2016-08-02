
/**
 * Dependencies
 */

const debug = require('../debug')('MenuScene');
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const { theme } = require('../../config');
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
        <View style={styles.header}>
          <View style={styles.left}>
            <TouchableOpacity
              testId="close-button"
              style={styles.close}
              onPress={this.onClosePress.bind(this)}>
              <Image
                style={styles.closeImage}
                source={require('../images/header-close-icon.png')}/>
            </TouchableOpacity>
          </View>
          <View style={styles.middle}>
            <Text style={styles.title}>settings</Text>
          </View>
          <View style={styles.right}/>
        </View>
        <View style={styles.list}>
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listItemText}>About Magnet</Text>
          </TouchableOpacity>
          <View style={styles.separator}/>
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listItemText}>Terms & Conditions</Text>
          </TouchableOpacity>
          <View style={styles.separator}/>
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listItemText}>Privacy Policy</Text>
          </TouchableOpacity>
          <View style={styles.separator}/>
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listItemText}>Feedback</Text>
          </TouchableOpacity>
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
  },

  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderBottomWidth: 0.7,
    borderBottomColor: '#ddd'
  },

  left: {
    width: 50,
  },

  right: {
    width: 50
  },

  middle: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    color: '#aaa',
    fontFamily: theme.fontLightItalic,
  },

  list: {
    paddingHorizontal: 7,
  },

  close: {
    padding: 14,
  },

  closeImage: {
    width: 18,
    height: 18,
    marginTop: 2,
  },

  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 7,
  },

  listItemText: {
    fontSize: 15,
    fontFamily: theme.fontBook,
  },

  separator: {
    height: 0.5,
    backgroundColor: '#eee'
  }
});
