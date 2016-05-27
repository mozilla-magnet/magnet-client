
/**
 * Dependencies
 */

var ReactNative = require('react-native');
var React = require('react');

var {
  ActivityIndicatorIOS,
  StyleSheet,
  View
} = ReactNative;

class SpinnerIOS extends React.Component {
  render() {
    return (
      <View style={[styles.root, this.props.style]}>
        <ActivityIndicatorIOS style={styles.spinner} styleAttr="Normal"/>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  spinner: {}
});

/**
 * Defines the properties passed to
 * this component that are used.
 *
 * @type {Object}
 */
SpinnerIOS.propTypes = {
  style: View.propTypes.style
};

/**
 * Exports
 */

module.exports = SpinnerIOS;
