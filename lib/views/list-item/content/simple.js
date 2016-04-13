
/**
 * Dependencies
 */

var debug = require('../../../debug')('ContentSimple');
var React = require('react-native');

/**
 * Locals
 */

var {
  Component,
  StyleSheet,
  Text,
  View
} = React;

class ContentSimple extends Component {
  constructor(props) {
    super(props);
    debug('created');
  }

  render() {
    debug('render');
    return (
      <View style={styles.root}>
        <Text style={styles.title}>{this.props.title}</Text>
        <Text style={styles.description}>{this.props.description}</Text>
      </View>
    );
  }
}

ContentSimple.propTypes = {
  url: React.PropTypes.string,
  title: React.PropTypes.string,
  description: React.PropTypes.string,
  icon: React.PropTypes.string,
  image: React.PropTypes.string
};

/**
 * Exports
 */

module.exports = ContentSimple;

var styles = StyleSheet.create({
  root: {
    padding: 14,
    backgroundColor: 'white'
  },

  title: {
    fontSize: 23,
    marginBottom: 7
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    color: '#666'
  }
});