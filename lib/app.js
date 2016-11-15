'use strict';

/**
 * Dependencies
 */

const SubscriptionsScene = require('./views/subscriptions-scene');
const SettingsScene = require('./views/settings-scene');
const notification = require('./notifications');
const ItemScene = require('./views/item/scene');
const ListScene = require('./views/list/scene');
const { bindActionCreators } = require('redux');
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const actions = require('./store/actions');
const track = require('./utils/tracker');
const debug = require('./debug')('App');
const Scanner = require('./scanner');
const React = require('react');
const api = require('./api');
const URL = require('url');

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

    // pre-bind context
    this.onDeepLink = this.onDeepLink.bind(this);

    // create the scanner
    this.scanner = new Scanner({
      onFound: this.props.itemFound,
      onLost: this.props.itemLost,
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
    Linking.getInitialURL().then(url => this.onDeepLink({ url }));
    Linking.addEventListener('url', this.onDeepLink);
    this.startScanning();
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.onDeepLink);
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
   * Called by `Navigator` to determine which
   * 'scene` gets rendered.
   */
  renderScene(route, navigator) {
    debug('render scene', route.type);

    switch (route.type) {
      case 'home': return <ListScene
        navigator={navigator}
        onRefresh={this.onRefresh.bind(this)}/>;
      case 'item': return <ItemScene
        navigator={navigator} />;
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

      // If the app goes in and out of focus
      // in quick succession start/stop can
      // get hammered. Magnet-scanner can cope
      // with this, but it will reject the call
      // if it's busy dealing with a previous one.
      .catch(e => {
        if (e.code === 'busy') return;
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
        Object.keys(prefs).forEach(key => {
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
   * WARNING: This can fire more than once per session
   */
  onDeepLink({ url }) {
    if (!url) return;
    debug('on deep link', url);
    const parsed = URL.parse(url, true);
    switch (parsed.host) {
      case 'item':
        this.props.itemOpened(parsed.query.url);
        this.refs.navigator.push({ type: 'item' });
      break;
    }
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
        }).then(() => {
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
    const { navigator } = this.refs;
    if (!navigator) return false;
    const stack = navigator.getCurrentRoutes();

    if (stack.length > 1) {
      navigator.pop();
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
  setUserFlag: React.PropTypes.func,
  itemFound: React.PropTypes.func,
  itemLost: React.PropTypes.func,
  itemOpened: React.PropTypes.func,
  clearItems: React.PropTypes.func,

  // state
  indicateScanning: React.PropTypes.bool,
  userFlags: React.PropTypes.object,
  items: React.PropTypes.object,
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
function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    itemFound: actions.itemFound,
    itemLost: actions.itemLost,
    itemOpened: actions.itemOpened,
    clearItems: actions.clearItems,
    setUserFlag: actions.setUserFlag,
    setIndicateScanning: actions.setIndicateScanning,
  }, dispatch);
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
