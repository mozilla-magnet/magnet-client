'use strict';

/**
 * Dependencies
 */

var debug = require('../debug')('MagnetWebView', 1);
var SpinnerView = require('./spinner');
var React = require('react-native');

var {
  requireNativeComponent,
  WebView,
  View,
  StyleSheet
} = React;

var RCT_WEBVIEW_REF = 'magnetwebview';

class MagnetWebView extends WebView {
  constructor() {
    super(...arguments);
    this.state = {
      loaded: false
    };
  }

  render() {
    debug('render');

    return (
      <View style={[styles.root, this.props.style]}>
        <RCTMagnetWebView
          ref={RCT_WEBVIEW_REF}
          key="magnetWebViewKey"
          source={this.props.source}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onLoaded={this._onLoaded.bind(this)}
          style={this.getWebviewStyle()}
        />
        {this.renderSpinnerView()}
      </View>
    );
  }

  renderSpinnerView() {
    debug('render spinner view');
    if (this.state.loaded) return null;
    return <SpinnerView style={styles.spinner}/>
  }

  getWebviewStyle() {
    var result = [styles.webview];
    if (!this.state.loaded) result.push(styles.hidden);
    return result;
  }

  _onLoaded({ nativeEvent: { height }}) {
    debug('loading finish');
    if (!this.props.onLoaded) return;
    this.props.onLoaded({ height });
    this.setState({ loaded: true });
  }
}

var styles = StyleSheet.create({
  root: {
    position: 'relative',
    flex: 1
  },

  webview: {
    flex: 1,
    opacity: 1
  },

  hidden: {
    height: 1,
    flex: 0,
    opacity: 0
  },

  spinner: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'white'
  }
});

var RCTMagnetWebView = requireNativeComponent('RCTMagnetWebView', MagnetWebView);

/**
 * Exports
 */

module.exports = MagnetWebView;
