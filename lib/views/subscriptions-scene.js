'use strict';

/**
 * Dependencies
 */

const debug = require('../debug')('SubscriptionsScene');
const { COMPLETE } = require('../store/constants');
const SubscribeButton = require('./subscribe-button');
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const HeaderBar = require('./header-bar');
const { theme } = require('../../config');
const React = require('react');
const api = require('../api');

const {
  subscribed,
  unsubscribed,
  subscriptionUpdated,
  fetchChannelsIfNeeded,
  fetchSubscriptionsIfNeeded,
} = require('../store/actions');

const {
  TouchableOpacity,
  InteractionManager,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  View,
  Text,
} = ReactNative;

class SubscriptionsScene extends React.Component {

  /**
   * Fetches the data for the view after
   * the component has mounted.
   *
   * We use the `InteractionManager` to schedule this
   * task to run after any pending animations to
   * prevent jank caused by blocking the JS thread.
   */
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      const { dispatch } = this.props;
      dispatch(fetchChannelsIfNeeded());
      dispatch(fetchSubscriptionsIfNeeded());
    });
  }

  render() {
    debug('render');

    return (
      <View style={styles.root}>
        {this.renderHeader()}
        {this.renderContent()}
      </View>
    );
  }

  renderHeader() {
    return <HeaderBar
      left={[
        <TouchableOpacity
          key="item1"
          style={styles.close}
          onPress={this.onClosePress.bind(this)}>
          <Image
            style={styles.closeImage}
            source={require('../images/header-close-icon.png')}/>
        </TouchableOpacity>,
      ]}

      center={<Text style={styles.title}>subscriptions</Text>}
    />;
  }

  renderContent() {
    return this.dataReady()
      ? this.renderList()
      : this.renderLoading();
  }

  renderList() {
    return <ScrollView style={styles.list}>{this.renderItems()}</ScrollView>;
  }

  renderItems() {
    const { subscriptions, channels } = this.props;
    debug('render items', subscriptions);

    return channels.value.map((channel, index) => {
      const borderTopWidth = index && 0.5;
      const id = channel.id;

      return <View
        key={channel.id}
        style={[styles.listItem, { borderTopWidth }]}
      >
        <View style={styles.listItemText}>
          <Text style={styles.listItemTextNode}>{channel.name}</Text>
        </View>
        <SubscribeButton
          subscribed={this.isSubscribed(id)}
          onChange={value => this.onSubscriptionChange(id, value)}/>
      </View>;
    });
  }

  renderLoading() {
    return <View style={styles.loading}>
      <ActivityIndicator
        animating={true}
        color={theme.colorPrimary}
        size="large"/>
    </View>;
  }

  isSubscribed(channelId) {
    const { subscriptions } = this.props;
    return subscriptions.value && !!subscriptions.value[channelId];
  }

  dataReady() {
    return this.props.channels.status === COMPLETE
      && this.props.subscriptions.status === COMPLETE;
  }

  onSubscriptionChange(channel_id, value) {
    if (value) this.onSubscribed(channel_id);
    else this.onUnsubscribed(channel_id);
  }

  onSubscribed(channel_id) {
    debug('on unsubscribed', channel_id);
    const { dispatch } = this.props;

    // update local state
    dispatch(subscribed(channel_id));

    // persist it
    api.post('subscriptions', {
      channel_id,
      notifications_enabled: true,
    })

    // update local state with latest model
      .then(subscription => {
        dispatch(subscriptionUpdated(subscription));
      });
  }

  onUnsubscribed(channel_id) {
    const { dispatch } = this.props;
    dispatch(unsubscribed(channel_id));
    api.delete('subscriptions', { channel_id });
  }

  onClosePress() {
    debug('on close press');
    this.props.navigator.pop();
  }
}

SubscriptionsScene.propTypes = {
  // state
  subscriptions: React.PropTypes.object,
  channels: React.PropTypes.object,
  navigator: React.PropTypes.object,

  // actions
  channelsFetching: React.PropTypes.func,
  channelsFetched: React.PropTypes.func,
  subscribed: React.PropTypes.func,
  unsubscribed: React.PropTypes.func,
  subscriptionUpdated: React.PropTypes.func,
  subscriptionsFetching: React.PropTypes.func,
  subscriptionsFetched: React.PropTypes.func,
  dispatch: React.PropTypes.func,
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
function mapStateToProps(store) {
  return {
    channels: store.channels,
    subscriptions: store.subscriptions,
  };
}

/**
 * Exports
 */

module.exports = connect(mapStateToProps)(SubscriptionsScene);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  close: {
    padding: 14,
  },

  closeImage: {
    width: 18,
    height: 18,
    marginTop: 2,
  },

  title: {
    fontSize: 22,
    color: '#aaa',
    fontFamily: theme.fontLightItalic,
  },

  list: {
    flex: 1,
  },

  listItem: {
    height: 64,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderTopColor: theme.borderColor,
  },

  listItemText: {
    flex: 1,
  },

  listItemTextNode: {
    fontSize: 17,
    fontFamily: theme.fontBook,
  },

  divider: {
    height: 1,
    backgroundColor: '#aaa',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
