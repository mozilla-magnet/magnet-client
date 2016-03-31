
/**
 * Dependencies
 */

var ContentSimple = require('./content/simple');
var ContentEmbed = require('./content/embed');
var debug = require('../debug')('ListItem');
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

class ListItem extends Component {
  constructor(props) {
    super(props);
    debug('created');
  }

  render() {
    debug('render');
    var ContentView = pickContentView(this.props);

    return (
      <View style={styles.root}>
        <Text
          style={styles.url}
          numberOfLines={1}
        >{this.props.url}</Text>
        <View style={styles.content}>
          <ContentView {...this.props}/>
        </View>
      </View>
    );
  }
}

ListItem.propTypes = {
  id: React.PropTypes.number,
  url: React.PropTypes.string
};

/**
 * Exports
 */

module.exports = ListItem;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingBottom: 14
  },

  url: {
    marginBottom: 7,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#aaa',
    fontSize: 11
  },

  content: {}
});

/**
 * Utils
 */

function pickContentView(item) {
  if (item.embed) return ContentEmbed;
  else return ContentSimple;
}