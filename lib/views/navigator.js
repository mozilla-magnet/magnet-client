
/**
 * Dependencies
 */

const debug = require('../debug')('AppNavigator');
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const { flags } = require('../../config');
const ItemScene = require('./item-scene');
const ListScene = require('./list-scene');
const MenuScene = require('./menu-scene');
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
        initialRoute={{type: 'root'}}
        configureScene={() => Navigator.SceneConfigs.FloatFromBottom}
        renderScene={this.renderScene.bind(this)}
      />
    );
  }

  renderScene(route, navigator) {
    debug('render scene', this.props.indicateScanning);

    switch (route.type) {
      case 'root': return <ListScene
        navigator={navigator}
        items={this.props.items}
        scanning={this.props.indicateScanning}
        onItemPress={this.onItemPress.bind(this)}
        onItemSwiped={this.onItemSwiped.bind(this)}
        onHeaderMenuPress={this.props.actions.openMenu}
        onRefresh={this.props.onRefresh}/>
      case 'item': return <ItemScene
        navigator={navigator}
        onClose={this.props.actions.closeItem}
        item={this.props.openItem} />
      case 'menu': return <MenuScene
        navigator={navigator}/>
    }
  }

  onSceneChange(prevScene, nextScene) {
    switch(nextScene) {
      case 'item': return this.refs.navigator.push({ type: 'item' });
      case 'menu': return this.refs.navigator.push({ type: 'menu' });
      case 'root': return this.refs.navigator.pop();
    }
  }

  onItemPress(item) {
    if (!flags.itemsExpandable) return Linking.openURL(item.unadaptedUrl);
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
