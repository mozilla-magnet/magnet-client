'use strict';

/**
 * Dependencies
 */

const debug = require('../debug')('SubscriptionsScene', 1);
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
    debug('render items', this.props.channels);
    if (!this.props.channels.value) return;
    return this.props.channels.value.map((channel, index) => {
      const borderTopWidth = index && 0.7;

      return <View
        key={channel.id}
        style={[styles.listItem, { borderTopWidth }]}
        ><Text style={styles.listItemText}>{channel.name}</Text>
      </View>;
    });
  }

  updateChannels() {
    if (this.props.channels.state) return;
    debug('update channels', this.props.channels);
    this.props.setChannels('fetching');
    api.get('channels')
      .then(result => this.props.setChannels('success', result))
      .catch(err => this.props.setChannels('error', err))
  }

  onClosePress() {
    debug('on close press');
    this.props.navigator.pop();
  }
}

SubscriptionsScene.propTypes = {
  // state
  channels: React.PropTypes.object,
  navigator: React.PropTypes.object,

  // actions
  setChannels: React.PropTypes.func,
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
    channels: store.channels
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
    setChannels: actions.setChannels
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
    height: 66,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderTopColor: theme.borderColor,
  },

  listItemText: {
    fontSize: 16,
    fontFamily: theme.fontBook
  },

  divider: {
    height: 1,
    backgroundColor: '#aaa'
  }
});
