'use strict';

/**
 * Dependencies
 */

const debug = require('../debug')('SubscriptionsScene', 1);
const SubscribeButton = require('./subscribe-button');
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const HeaderBar = require('./header-bar');
const actions = require('../store/actions');
const { theme } = require('../../config');
const React = require('react');
const api = require('../api');

const {
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  View,
  Text,
} = ReactNative;

class SubscriptionsScene extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.updateChannels();
    this.updateSubscriptions();
    // api.post('subscriptions', { channel_id: 'bar', notifications_enabled: true })
    //   .then(result => {
    //     console.log('POSTED', result);
    //   });
    //
    // api.get('subscriptions')
    //   .then(result => {
    //     console.log('GOT', result);
    //   });
  }

  render() {
    debug('render');

    return (
      <View style={styles.root}>
        {this.renderHeader()}
        <ScrollView style={styles.list}>{this.renderItems()}</ScrollView>
      </View>
    );
  }

  renderHeader() {
    return <HeaderBar
      left={[<TouchableOpacity
          key="item1"
          style={styles.close}
          onPress={this.onClosePress.bind(this)}>
          <Image
            style={styles.closeImage}
            source={require('../images/header-close-icon.png')}/>
        </TouchableOpacity>
      ]}

      center={<Text style={styles.title}>subscriptions</Text>}
    />
  }

  renderItems() {
    const { subscriptions, channels } = this.props;
    debug('render items', subscriptions);

    if (!channels.value) return;

    return channels.value.map((channel, index) => {
      const borderTopWidth = index && 0.7;
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

  isSubscribed(channelId) {
    const { subscriptions } = this.props;
    return subscriptions.value && !!subscriptions.value[channelId];
  }

  updateChannels() {
    if (this.props.channels.state) return;
    debug('update channels', this.props.channels);
    this.props.setChannels('fetching');
    api.get('channels')
      .then(result => this.props.setChannels('success', result))
      .catch(err => this.props.setChannels('error', err))
  }

  updateSubscriptions() {
    if (this.props.subscriptions.state) return;
    debug('update subscriptions', this.props.subscriptions);
    this.props.subscriptionsFetch('fetching');
    api.get('subscriptions')
      .then(result => this.props.subscriptionsFetch('success', result))
      .catch(err => this.props.subscriptionsFetch('error', err))
  }

  onSubscriptionChange(id, value) {
    debug('on subscription change', id, value);
    this.props.subscriptionChange(id, value);
    // api.post('subscriptions', { channel_id: id, notifications_enabled: true });
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
  setChannels: React.PropTypes.func,
  subscriptionChange: React.PropTypes.func,
  subscriptionsFetch: React.PropTypes.func,
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
 * Maps the methods exported from `action-creators.js`
 * to `this.props.<ACTION_NAME>`.
 *
 * @param  {function} dispatch
 * @return {Object}
 */
function mapDispatchToProps() {
  return {
    setChannels: actions.setChannels,
    subscriptionsFetch: actions.subscriptionsFetch,
    subscriptionChange: actions.subscriptionChange,
  }
}

/**
 * Exports
 */

module.exports = connect(mapStateToProps, mapDispatchToProps)(SubscriptionsScene);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff'
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
    fontFamily: theme.fontBook
  },

  divider: {
    height: 1,
    backgroundColor: '#aaa'
  }
});
