
/**
 * Dependencies
 */

var HeaderBarView = require('./header-bar');
var ReactNative = require('react-native');
var theme = require('../../config').theme;
var debug = require('../debug')('App');
var Scanner = require('../scanner');
var ListView = require('./list');
var React = require('react');

var {
  LayoutAnimation,
  StyleSheet,
  StatusBar,
  Alert,
  View
} = ReactNative;

/**
 * The length of time to scan for.
 *
 * @type {Number}
 */
const SCAN_LENGTH = 8000; // 8secs

/**
 * The length of time between scans.
 *
 * @type {Number}
 */
const SCAN_INTERVAL = 30000; // 30secs

class AppView extends React.Component {
  constructor(props) {
    super(props);

    // initial state
    this.state = {
      awaitingFirstScan: true,
      scanning: false,
      items: []
    };

    // bind callback context
    this.scan = this.scan.bind(this);

    // create scanner (accepts test mock)
    this.scanner = props.scanner || new Scanner(); // eslint-disable-line

    this.scanner.on('update', this.onScannerUpdate.bind(this));
    this.scanner.on('networkerror', this.onScannerNetworkError.bind(this));

    // Finding something before react-native is
    // fully initialized can cause a crash:
    // https://github.com/walmartreact/react-native-orientation-listener/issues/8
    // TODO: This should be fixed inside NetworkScanner.java
    setTimeout(this.scan, 100);
  }

  scan(options={}) {
    if (this.state.scanning) return;
    debug('scanning ...');

    clearTimeout(this.nextScanTimeout);

    this.setState({
      awaitingFirstScan: false,
      scanning: true
    });

    if (options.clear) this.scanner.clear();

    this.scanner.scan(SCAN_LENGTH).then(() => {
      this.nextScanTimeout = setTimeout(this.scan, SCAN_INTERVAL);
      this.setState({ scanning: false });
      debug('scan complete');
    });
  }

  render() {
    debug('render', this.state.items.length);
    var scanning = this.state.awaitingFirstScan || this.state.scanning;

    return (
      <View style={[styles.root, this.props.style]}>
        <StatusBar backgroundColor="#ccc" />
        <ListView
          ref={ref => this.listView = ref}
          style={styles.list}
          items={this.state.items}
          scanning={scanning}
          onRefresh={this.onRefresh.bind(this)}
          onItemSwiped={this.onItemSwiped.bind(this)}/>
        <HeaderBarView
          style={styles.headerBar}
          scanning={this.state.scanning}/>
      </View>
    )
  }

  onRefresh() {
    debug('on refresh');
    this.scan({ clear: true });
  }

  onItemSwiped(item) {
    this.removeItem(item.props.id)
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
  },

  list: {
    paddingTop: 62
  }
});

/**
 * Exports
 */

module.exports = AppView;
