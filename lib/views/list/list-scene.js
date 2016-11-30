'use strict';

/**
 * Dependencies
 */

import React, { Component, PropTypes } from 'react';
import { flags } from '../../../config';
import track from '../../utils/tracker';
import HeaderBar from '../header-bar';
import { connect } from 'react-redux';
import Debug from '../../debug';
import ListView from './list';

import {
  fetchItemIfNeeded,
} from '../../store/actions';

import {
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  View,
} from 'react-native';

const debug = Debug('ListScene');

class ListScene extends Component {
  constructor(props) {
    super(props);
    this.onItemPress = this.onItemPress.bind(this);
  }

  componentDidMount() {
    this.fetchItemsIfNeeded();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.items !== this.props.items) {
      this.fetchItemsIfNeeded();
    }
  }

  fetchItemsIfNeeded() {
    const { items, dispatch } = this.props;
    items.forEach(item => dispatch(fetchItemIfNeeded(item.id)));
  }

  render() {
    debug('render');

    return (
      <View style={styles.root}>
        {this.renderHeader()}
        <ListView
          ref="list"
          style={{flex:1}}
          items={this.props.items}
          sortByDistance={this.props.sortByDistance}
          showDistance={this.props.showDistance}
          scanning={this.props.indicateScanning}
          onRefresh={this.props.onRefresh}
          onItemPress={this.onItemPress}/>
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
    this.props.navigator.push({
      type: 'item',
      itemId: id,
    });
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
  indicateScanning: PropTypes.bool,
  navigator: PropTypes.object,
  userFlags: PropTypes.object,
  showDistance: PropTypes.bool,
  sortByDistance: PropTypes.bool,
  items: PropTypes.array,

  onRefresh: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
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
function mapStateToProps({ items, itemsNearby, userFlags, indicateScanning }) {
  const { sortByDistance, showDistance } = userFlags;

  return {
    items: itemsNearby.map(id => items[id]),
    sortByDistance: sortByDistance.value,
    showDistance: showDistance.value,
    userFlags,
    indicateScanning,
  };
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
