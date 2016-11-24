
/**
 * Dependencies
 */

var debug = require('../debug')('HeaderBar');
var ReactNative = require('react-native');
var React = require('react');

var {
  StyleSheet,
  View,
} = ReactNative;

class HeaderBarView extends React.Component {
  render() {
    debug('render');

    return (
      <View style={[styles.root]}>
        <View style={styles.left}>{this.props.left}</View>
        <View style={styles.center}>{this.props.center}</View>
        <View style={styles.right}>{this.props.right}</View>
      </View>
    );
  }

  componentWillUpdate() {
    // LayoutAnimation.easeInEaseOut();
  }
}

HeaderBarView.propTypes = {
  style: View.propTypes.style,
  left: React.PropTypes.array,
  center: React.PropTypes.element,
  right: React.PropTypes.array,
};

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 4,
    borderBottomWidth: 0.7,
    borderBottomColor: '#ddd',
  },

  left: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  center: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  right: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },

  close: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeImage: {
    width: 20,
    height: 20,
  },
});

/**
 * Exports
 */

module.exports = HeaderBarView;
