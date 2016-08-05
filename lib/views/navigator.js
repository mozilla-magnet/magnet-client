
/**
 * Dependencies
 */

const debug = require('../debug')('AppNavigator');
const SettingsScene = require('./settings-scene');
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const { flags } = require('../../config');
const ItemScene = require('./item-scene');
const ListScene = require('./list-scene');
const track = require('../utils/tracker');
const React = require('react');

const {
  BackAndroid,
  Navigator,
  Linking,
  View,
} = ReactNative;

/**
 * Main app view
 *
 * @type {ReactComponent}
 */
class AppNavigator extends React.Component {
  constructor(props) {
    super(props);
    BackAndroid.addEventListener('hardwareBackPress', this.onAndroidBack.bind(this))
  }

  render() {
    return (
      <Navigator
        ref="navigator"
        initialRoute={{type: 'home'}}
        configureScene={() => Navigator.SceneConfigs.FloatFromBottom}
        onDidFocus={this.onNavigated.bind(this)}
        renderScene={this.renderScene.bind(this)}
      />
    );
  }

  renderScene({ type }, navigator) {
    debug('render scene', type);

    switch (type) {
      case 'home': return <ListScene
        navigator={navigator}
        items={this.props.items}
        scanning={this.props.indicateScanning}
        onItemPress={this.onItemPress.bind(this)}
        onItemSwiped={this.onItemSwiped.bind(this)}
        onRefresh={this.props.onRefresh}/>
      case 'item': return <ItemScene
        navigator={navigator}
        onClose={this.props.actions.closeItem}
        item={this.props.openItem} />
      case 'settings': return <SettingsScene navigator={navigator}/>
    }
  }

  onNavigated({ type }) {
    debug('navigated', type);
    track.view(type);
  }

  onItemPress(item) {
    track.tapListItem(item.unadaptedUrl || item.url);
    if (!flags.itemsExpandable) return this.navigateToItem(item);
    this.props.actions.openItem(item);
    this.refs.navigator.push({ type: 'item' });
  }

  onItemSwiped(item) {
    this.props.actions.updateItem({
      ...item,
      hidden: true
    });
  }

  /**
   * Responds to Android hardware back button.
   *
   * Returning `false` indicates the app
   * isn't handling the event and allows
   * the system to respond.
   *
   * @return {Boolean}
   */
  onAndroidBack() {
    debug('android back');
    var stack = this.refs.navigator.getCurrentRoutes();

    if (stack.length > 1) {
      this.refs.navigator.pop();
      return true;
    }

    // let system handle event
    // (minimises android app)
    return false;
  }

  /**
   * Instruct the device to navigate
   * to the item's url.
   *
   * If the item hasn't been 'upgraded'
   * by the metadata server yet it won't
   * have the `unadaptedUrl` property.
   *
   * @param  {object} item
   */
  navigateToItem(item) {
    Linking.openURL(item.unadaptedUrl || item.url);
  }
}

AppNavigator.propTypes = {
  style: View.propTypes.style,
  openItem: React.PropTypes.object,
  actions: React.PropTypes.object,
  items: React.PropTypes.array,
  onRefresh: React.PropTypes.func.isRequired,
  indicateScanning: React.PropTypes.bool,
}

const mapStateToProps = function(store) {
  return {
    indicateScanning: store.indicateScanning,
    openItem: store.openItem,
    items: store.items,
  };
}

/**
 * Exports
 */

module.exports = connect(mapStateToProps)(AppNavigator);
