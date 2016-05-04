
/**
 * Dependencies
 */

var React = require('react-native');

var {
  ActivityIndicatorIOS,
  Component,
  StyleSheet,
  View
} = React;

class SpinnerIOS extends Component {
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
