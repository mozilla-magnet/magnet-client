'use strict';

/**
 * Dependencies
 */

const resolveItem = require('../../store/resolve-item');
const debug = require('../../debug')('ListScene');
const actions = require('../../store/actions');
const { flags } = require('../../../config');
const track = require('../../utils/tracker');
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const HeaderBar = require('../header-bar');
const ListView = require('./list');
const React = require('react');

const {
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  View,
} = ReactNative;

class ListScene extends React.Component {
  constructor(props) {
    super(props);
    this.onItemPress = this.onItemPress.bind(this);
    this.onItemSwiped = this.onItemSwiped.bind(this);
  }

  render() {
    debug('render', this.props.scanning);

    return (
      <View style={styles.root}>
        {this.renderHeader()}
        <ListView
          ref="list"
          style={{flex:1}}
          items={this.props.items}
          sortByDistance={this.props.sortByDistance}
          showDistance={this.props.showDistance}
          scanning={this.props.scanning}
          onRefresh={this.props.onRefresh}
          onItemPress={this.onItemPress}
          onItemSwiped={this.onItemSwiped}/>
      </View>
    );
  }

  renderHeader() {
    return <HeaderBar
      center={<TouchableOpacity style={styles.logo}>
          <Image
            style={styles.logoImage}
            source={require('../../images/header-logo.png')}/>
        </TouchableOpacity>}

      right={[
        this.renderSubscriptionsButton(),
        <TouchableOpacity
          key="icon2"
          style={[styles.settings, { paddingRight: 6 }]}
          onPress={this.onSettingsPress.bind(this)}>
          <Image
            style={styles.settingImage}
            source={require('../../images/header-settings-icon.png')}/>
        </TouchableOpacity>,
      ]}
    />;
  }

  renderSubscriptionsButton() {
    return <TouchableOpacity
      key="icon1"
      style={styles.settings}
      onPress={this.onSubscriptionsPress.bind(this)}>
      <Image
        style={styles.subscriptionsImage}
        source={require('../../images/header-subscriptions-icon.png')}/>
    </TouchableOpacity>;
  }

  onRefresh() {}

  /**
   * Called when a list-item is pressed.
   *
   * Depending on what prefs are set, this
   * could open the expanded view, or simply
   * navigate to the item's url.
   */
  onItemPress(id) {
    track.tapListItem(id);
    if (!flags.itemsExpandable) return Linking.openURL(id);
    this.props.itemOpened(id);
    this.props.navigator.push({ type: 'item' });
  }

  onItemSwiped(item) {
    // this.props.updateItem(item.id, { hidden: true });
  }

  onSubscriptionsPress() {
    debug('on subscriptions press');
    this.props.navigator.push({ type: 'subscriptions' });
  }

  onSettingsPress() {
    debug('on settings press');
    this.props.navigator.push({ type: 'settings' });
  }
}

ListScene.propTypes = {
  items: React.PropTypes.array,
  scanning: React.PropTypes.bool,
  navigator: React.PropTypes.object,
  userFlags: React.PropTypes.object,
  showDistance: React.PropTypes.bool,
  sortByDistance: React.PropTypes.bool,

  onRefresh: React.PropTypes.func.isRequired,
  itemOpened: React.PropTypes.func.isRequired,
};

/**
 * Takes the redux `store` (passed down by
 * the parent `Provider`) view and maps
 * specific properties onto the App's
 * `this.props` object.
 *
 * This means the app never touches the
 * redux store directly and prevents
 * hacky code being written.
 *
 * @param  {ReduxStore} store
 * @return {Object}
 */
function mapStateToProps(state) {
  const { sortByDistance, showDistance } = state.userFlags;
  const items = state.itemsNearby
    .map(url => resolveItem(url))
    .filter(item => !!item);

  return {
    items,
    userFlags: state.userFlags,
    indicateScanning: state.indicateScanning,
    sortByDistance: sortByDistance.value,
    showDistance: showDistance.value,
  };
}

/**
 * Maps the methods exported from `action-creators.js`
 * to `this.props.<ACTION_NAME>`.
 *
 * @param  {function} dispatch
 * @return {Object}
 */
function mapDispatchToProps() {
  return actions;
}

/**
 * Exports
 */

module.exports = connect(mapStateToProps, mapDispatchToProps)(ListScene);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  logo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 1,
  },

  logoImage: {
    width: 141.76,
    height: 22.8,
  },

  settings: {
    width: 37,
    paddingTop: 1,
    paddingLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingImage: {
    width: 22,
    height: 22,
  },

  subscriptionsImage: {
    width: 22,
    height: 23,
  },
});
