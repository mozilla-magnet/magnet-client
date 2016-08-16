
/**
 * Dependencies
 */

const debug = require('../debug')('ListScene');
const ReactNative = require('react-native');
const HeaderBar = require('./header-bar');
const ListView = require('./list');
const React = require('react');

const {
  StyleSheet,
  View,
} = ReactNative;

class ListScene extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    debug('render', this.props.scanning);
    return (
      <View style={styles.root}>
        <HeaderBar onMenuPress={this.onMenuPress.bind(this)}/>
        <ListView
          ref="list"
          style={{flex:1}}
          items={this.props.items}
          scanning={this.props.scanning}
          onRefresh={this.props.onRefresh}
          onItemPress={this.props.onItemPress}
          onItemSwiped={this.props.onItemSwiped}/>
      </View>
    );
  }

  onRefresh() {}
  onMenuPress() {
    debug('on menu press');
    this.props.navigator.push({ type: 'settings' });
  }
}

ListScene.propTypes = {
  items: React.PropTypes.array,
  scanning: React.PropTypes.bool,
  navigator: React.PropTypes.object,
  onItemPress: React.PropTypes.func.isRequired,
  onItemSwiped: React.PropTypes.func.isRequired,
  onRefresh: React.PropTypes.func.isRequired,
};

/**
 * Exports
 */

module.exports = ListScene;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff'
  }
});
