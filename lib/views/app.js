
/**
 * Dependencies
 */

const Metrics = require('../utils/metrics').Metrics;
var HeaderBarView = require('./header-bar');
var ReactNative = require('react-native');
var theme = require('../../config').theme;
var debug = require('../debug')('App');
var Scanner = require('../scanner');
var ListView = require('./list');
var React = require('react');

var {
  LayoutAnimation,
  BackAndroid,
  StyleSheet,
  StatusBar,
  AppState,
  Alert,
  View
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

    // initial state
    this.state = {
      listExpanded: false,
      items: []
    };

    this.scanning = false;

    // create scanner (accepts test mock)
    this.scanner = props.scanner || new Scanner(); // eslint-disable-line

    this.scanner.on('update', this.onScannerUpdate.bind(this));
    this.scanner.on('networkerror', this.onScannerNetworkError.bind(this));

    // respond to app background/foreground changes
    AppState.addEventListener('change', this.onAppStateChanged.bind(this));

    // respond to android hardware back button press
    BackAndroid.addEventListener('hardwareBackPress', this.onAndroidBack.bind(this))
  }

  componentDidMount() {
    debug('mounted');
    this.startScanning();
  }

  startScanning() {
    if (this.scanning) return;
    debug('start scanning');
    this.scanner.start()
      .then(() => {
        this.setState({ initialScanPeriod: true });
        this.scanning = true;

        clearTimeout(this.initialScanPeriodTimeout);
        this.initialScanPeriodTimeout = setTimeout(() => {
          this.setState({ initialScanPeriod: false });
        }, INITIAL_SCAN_PERIOD);
      });
  }

  stopScanning() {
    if (!this.scanning) return;
    debug('stop scanning');
    this.scanner.stop();
    this.setState({ initialScanPeriod: false });
    this.scanning = false;
    debug('stopped', this.scanning);
  }

  render() {
    debug('render', this.state.items.length);
    var scanning = this.state.initialScanPeriod;

    return (
      <View style={[styles.root, this.props.style]}>
        <StatusBar backgroundColor="#ccc" />
        <ListView
          ref="list"
          items={this.state.items}
          scanning={scanning}
          contentOffsetY={62}
          onRefresh={this.onRefresh.bind(this)}
          onItemPressed={this.onItemPressed.bind(this)}
          onItemSwiped={this.onItemSwiped.bind(this)}/>
        <HeaderBarView
          style={styles.headerBar}
          expandedMode={this.state.listExpanded}
          onClosePressed={this.onHeaderClosePressed.bind(this)}
          onHamburgerPressed={this.onHeaderHamburgerPressed.bind(this)}
          onMorePressed={this.onHeaderMorePressed.bind(this)}
          />
      </View>
    )
  }

  onRefresh() {
    debug('on refresh');
    this.stopScanning();
    this.scanner.clear();
    this.startScanning();
  }

  onItemSwiped(item) {
    this.removeItem(item.props.id)
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

    // contract list if expanded
    if (this.state.listExpanded) {
      this.contractList();
      return true;
    }

    // let system handle event
    // (minimises android app)
    return false;
  }

  onHeaderClosePressed() {
    debug('header close pressed');
    this.contractList();
  }

  onHeaderHamburgerPressed() {
    debug('header hamburger pressed');
    // TODO: Implement
  }

  onHeaderMorePressed() {
    debug('header more pressed');
    // TODO: Implement
  }

  onItemPressed(item) {
    debug('on item tapped');
    this.setState({ listExpanded: true });
    this.refs.list.expand(item);
  }

  onAppStateChanged(state) {
    debug('app state changed', state);
    switch (state) {
      case 'active': this.startScanning(); break;
      case 'background': this.stopScanning(); break;
    }
  }

  contractList() {
    this.refs.list.contract();
    this.setState({ listExpanded: false });
  }

  setItems(items) {
    return new Promise(resolve => {
      var config = LayoutAnimation.Presets.easeInEaseOut;
      LayoutAnimation.configureNext(config);
      this.setState({ items });

      // HACK: `LayoutAnimation` callback doesn't
      // appear to be working. In the meantime we'll
      // use `setTimeout()` for an approximate callback
      setTimeout(resolve, config.duration + 50);
    });
  }

  removeItem(id) {
    debug('remove item', id);
    var items = this.state.items;

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (item.id === id) {
        debug('found match')
        items.splice(i, 1);
        return this.setItems(items);
      }
    }

    return Promise.resolve();
  }

  onScannerUpdate(items) {
    debug('on scanner update', items);
    this.setItems(items);
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
}

AppView.propTypes = {
  style: View.propTypes.style
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    flex: 1,
    backgroundColor: theme.colorBackground
  },

  headerBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    height: 56,
    backgroundColor: 'rgba(242,242,242,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  }
});

/**
 * Exports
 */

module.exports = AppView;
