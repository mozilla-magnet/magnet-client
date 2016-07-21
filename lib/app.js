'use strict';

/**
 * Dependencies
 */

const Metrics = require('./utils/metrics').Metrics;
var AppNavigator = require('./views/navigator');
var ReactNative = require('react-native');
var { Provider } = require('react-redux');
var debug = require('./debug')('App', 1);
var React = require('react');
const Scanner = require('./scanner');
const store = require('./store');
const actions = store.actions;

const {
  AppState,
  Platform,
  Alert,
  View,
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
const INITIAL_SCAN_PERIOD = 8000; // 8secs

/**
 * Main app view
 *
 * @type {ReactComponent}
 */
class AppView extends React.Component {
  constructor(props) {
    super(props);

    // Metrics
    Metrics.launch();
    Metrics.install();

    this.scanning = false;

    this.scanner = props.scanner || new Scanner({  // eslint-disable-line
      onUpdate: actions.updateItem,
      onLost: actions.removeItem,
    });

    this.scanner.on('networkerror', this.onScannerNetworkError.bind(this));

    // respond to app background/foreground changes
    AppState.addEventListener('change', this.onAppStateChanged.bind(this));
  }

  componentDidMount() {
    debug('mounted');
    this.startScanning();
  }

  startScanning() {
    if (this.scanning) return;
    debug('start scanning');
    actions.indicateScanning(true);
    this.scanning = true;
    this.scanner.start()
      .then(() => {
        clearTimeout(this.initialScanPeriodTimeout);
        this.initialScanPeriodTimeout = setTimeout(() => {
          actions.indicateScanning(false);
        }, INITIAL_SCAN_PERIOD);
      });
  }

  stopScanning() {
    if (!this.scanning) return;
    debug('stop scanning');
    this.scanner.stop();
    this.scanning = false;
    actions.indicateScanning(false);
    debug('stopped', this.scanning);
  }

  render() {
    debug('render');
    return (
      <Provider store={store}>
        <AppNavigator
          actions={actions}
          onRefresh={this.onRefresh.bind(this)}
        />
      </Provider>
    );
  }

  onAppStateChanged(state) {
    debug('app state changed', state);
    switch (state) {
      case 'active': return this.onBackground();
      case 'background': return this.onActive();
    }
  }

  /**
   * Called when app comes to foreground.
   */
  onActive() {
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
    if (Platform.OS == 'ios') return;
    this.stopScanning();
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
        onPress: this.onNetworkAlertClosed.bind(this)
      }]
    );
  }

  onNetworkAlertClosed() {
    setTimeout(() => this.networkAlertOpen = false, 500)
  }

  onRefresh() {
    debug('on refresh');
    this.stopScanning();
    actions.clearItems();
    setTimeout(() => {
      this.startScanning();
    }, 1000);
  }
}

AppView.propTypes = {
  style: View.propTypes.style
}

/**
 * Exports
 */

module.exports = AppView;
