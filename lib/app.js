'use strict';

/**
 * Dependencies
 */

const api = require('./api');
const SubscriptionsScene = require('./views/subscriptions-scene');
const SettingsScene = require('./views/settings-scene');
const notification = require('./notifications');
const ItemScene = require('./views/item-scene');
const ListScene = require('./views/list-scene');
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const actions = require('./store/actions');
const track = require('./utils/tracker');
const debug = require('./debug')('App');
const { flags } = require('../config');
const Scanner = require('./scanner');
const React = require('react');

const {
  BackAndroid,
  Navigator,
  AppState,
  Platform,
  Linking,
  Alert,
} = ReactNative;

/**
 * The length of time we expect to
 * find nearby items in.
 *
 * If nothing is found in this time
 * period, we assume there's nothing
 * there.
 *
 * @type {Number}
 */
const INITIAL_SCAN_PERIOD = 8000; // 8 secs

/**
 * Main app view.
 *
 * Has no visual state, acts as 'container' for
 * app UI, composing components and supplying
 * them with the correct data.
 *
 * Uses `Navigator` to split the views into different 'scenes'.
 *
 * The parent `Provider` view passes the ReduxStore
 * `store`. We use 'react-redux' to expose *parts*
 * of this store to this view's `this.props.*`.
 *
 * @type {ReactComponent}
 */
class App extends React.Component {
  constructor(props) {
    super(props);

    // create the scanner
    this.scanner = new Scanner({
      onUpdate: this.props.updateItem,
      onLost: this.props.removeItem,
      onMetadata: this.props.setItemMetadata,
      expiryEnabled: this.enabled.bind(this, 'removeOldItems'),
      getItems: () => this.props.items,
    });

    // we need to use telemetry after we
    // inflate the store with the user flags
    this.inflateUserFlags().then(() => {
      track.appLaunch();
      this.setupNotificationListeners();
    });

    // when network is bad, the scanner errors
    this.scanner.on('networkerror', this.onScannerNetworkError.bind(this));

    // respond to app background/foreground changes
    AppState.addEventListener('change', this.onAppStateChanged.bind(this));

    BackAndroid.addEventListener('hardwareBackPress', this.onAndroidBack.bind(this));
  }

  componentDidMount() {
    debug('mounted');
    this.startScanning();
  }

  /**
   * Triggered whenever the redux store updates.
   * We use this hook to channel the event to more
   * granular callbacks.
   */
  componentWillReceiveProps(next) {
    var current = this.props;
    if (next.userFlags !== current.userFlags) this.onUserFlagsChange(next.userFlags);
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

  /**
   * Called by `Navigator` to determin which
   * 'scene` gets rendered.
   */
  renderScene({ type }, navigator) {
    debug('render scene', type, this.props.openItem);

    switch (type) {
      case 'home': return <ListScene
        navigator={navigator}
        items={this.props.items}
        scanning={this.props.indicateScanning}
        onItemPress={this.onItemPress.bind(this)}
        onItemSwiped={this.onItemSwiped.bind(this)}
        userFlags={this.props.userFlags}
        onRefresh={this.onRefresh.bind(this)}/>;
      case 'item':
      return <ItemScene
        navigator={navigator}
        item={this.props.openItem} />;
      case 'settings': return <SettingsScene
        navigator={navigator}
        userFlags={this.props.userFlags}
        onSettingChange={this.props.setUserFlag}/>;
      case 'subscriptions': return <SubscriptionsScene
        navigator={navigator}/>;
    }
  }

  startScanning() {
    debug('start scanning');
    this.props.setIndicateScanning(true);
    this.scanner.start()
      .then(() => {
        debug('scanning started');
        clearTimeout(this.initialScanPeriodTimeout);
        this.initialScanPeriodTimeout = setTimeout(() => {
          this.props.setIndicateScanning(false);
        }, INITIAL_SCAN_PERIOD);
      })

      .catch(e => {
        debug(`scanning failed to start: ${e}`);
        this.props.setIndicateScanning(false);
      });
  }

  stopScanning() {
    debug('stop scanning');
    this.scanner.stop();
    this.props.setIndicateScanning(false);
    debug('stopped', this.scanning);
  }

  /**
   * Check if the app was first launched from
   * a notification and listen for subsequent
   * launches.
   */
  setupNotificationListeners() {
    notification.on('applaunch', () => track.appLaunchFromNotification());
    notification.on('dismiss', () => track.notificationDismiss());
    notification.launchedApp()
      .then(result => {
        if (result) track.appLaunchFromNotification();
      });
  }

  /**
   * When app boots the `userProps` state contains
   * only the default values. We have to fetch
   * the user's persisted values from an async
   * data-store. Once fetched we update or
   * 'inflate' the redux store with the
   * 'real' values.
   *
   * @return {Promise}
   */
  inflateUserFlags() {
    debug('inflate user flags');
    return api.get('preferences')
      .then(prefs => {
        Object.keys(prefs ).forEach(key => {
          debug('got user flag', key, prefs[key]);
          const value = parseBoolean(prefs[key]);
          if (value == null) return;
          this.props.setUserFlag(key, value);
          debug('inflated user flag', key, value);
        });
      });
  }

  /**
   * A convenient helper to check if a user-flag
   * is enabled or not.
   */
  enabled(key) {
    var flag = this.props.userFlags[key];
    return !flag ? true : flag.value;
  }

  /**
   * Called whenever the user changes a flag.
   *
   * We use this moment to persist their
   * chosen value to a data-store.
   *
   * @param {Object} nextUserFlags
   */
  onUserFlagsChange(nextUserFlags) {
    debug('on user flags change');
    this.persistUserFlags(nextUserFlags);
    track.enable(nextUserFlags.enableTelemetry.value);
  }

  persistUserFlags(flags) {
    Object.keys(flags).reduce((previous, key) => {
      return previous.then(() => {
        const { value } = flags[key];

        return api.post('preferences', {
          pref_key: key,
          value,
        }).then(() => {;
          debug('persisted user flag', key, value);
        });
      });
    }, Promise.resolve());
  }

  /**
   * Called when the app moves to the
   * background or comes to the foreground.
   *
   * NOTE: This also fires when system dialogs
   * cover the app (eg. bluetooth prompt).
   *
   * @param {String} state
   */
  onAppStateChanged(state) {
    debug('app state changed', state);
    switch (state) {
      case 'active': return this.onForeground();
      case 'background': return this.onBackground();
    }
  }

  /**
   * Called when app comes to foreground.
   */
  onForeground() {
    track.appInForeground();
    this.startScanning();
  }

  /**
   * Called when app goes to background.
   *
   * We don't stop the scanner for iOS, as
   * we need the native scanner callback to
   * keep firing so that we can dispatch
   * notifications. In iOS there is no way
   * of spinning up background services
   * like in android.
   */
  onBackground() {
    track.appInBackground();
    if (!platform('ios')) {
      this.stopScanning();
    }
  }

  onScannerNetworkError() {
    debug('on network error');
    if (this.networkAlertOpen) return;
    this.networkAlertOpen = true;

    Alert.alert(
      'Network error',
      'Please check your internet connection',
      [{
        text: 'OK',
        onPress: this.onNetworkAlertClosed.bind(this),
      }]
    );
  }

  onNetworkAlertClosed() {
    setTimeout(() => this.networkAlertOpen = false, 500);
  }

  /**
   * Called when the user refreshes the list
   * via a pull-to-refresh gesture.
   */
  onRefresh() {
    debug('on refresh');
    track.pullRefresh();
    this.stopScanning();
    this.props.clearItems();
    this.startScanning();
  }

  /**
   * Called when the navigator finishes
   * a transition to a new 'scene'.
   */
  onNavigated({ type }) {
    debug('navigated', type);
    track.view(type);
  }

  /**
   * Called when a list-item is pressed.
   *
   * Depending on what prefs are set, this
   * could open the expanded view, or simply
   * navigate to the item's url.
   */
  onItemPress(item) {
    var url = item.metadata ? item.metadata.unadaptedUrl : item.url;
    track.tapListItem(url);
    if (!flags.itemsExpandable) return Linking.openURL(url);
    this.props.setOpenItem(item.id);
    this.refs.navigator.push({ type: 'item' });
  }

  onItemSwiped(item) {
    this.props.updateItem(item.id, { hidden: true });
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

App.propTypes = {

  // actions
  setIndicateScanning: React.PropTypes.func,
  setChannels: React.PropTypes.func,
  setOpenItem: React.PropTypes.func,
  setItemMetadata: React.PropTypes.func,
  setUserFlag: React.PropTypes.func,
  updateItem: React.PropTypes.func,
  removeItem: React.PropTypes.func,
  clearItems: React.PropTypes.func,

  // state
  indicateScanning: React.PropTypes.bool,
  userFlags: React.PropTypes.object,
  openItem: React.PropTypes.object,
  items: React.PropTypes.array,
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
    indicateScanning: store.indicateScanning,
    userFlags: store.userFlags,
    openItem: store.openItem,
    items: store.items,
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

module.exports = connect(mapStateToProps, mapDispatchToProps)(App);

/**
 * Utils
 */

function parseBoolean(value) {
  switch (value) {
    case 'true': return true;
    case 'false': return false;
    case true: return true;
    case false: return false;
    default: return null;
  }
}

function platform(value) {
  return Platform.OS === value;
}
