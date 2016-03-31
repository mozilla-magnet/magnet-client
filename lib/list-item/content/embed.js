
/**
 * Dependencies
 */

var React = require('react-native');
var debug = require('../../debug')('ContentEmbed');

/**
 * Locals
 */

var {
  Component,
  StyleSheet,
  Dimensions,
  WebView,
  View,
  ProgressBarAndroid
} = React;

class ContentEmbed extends Component {
  constructor(props) {
    super(props);
    this.renderLoading = this.renderLoading.bind(this);
    debug('created');
  }

  getWebViewSize() {
    var embed = this.props.embed;
    var aspect = embed.height / embed.width;
    var win = Dimensions.get('window');
    var padding = 14 * 2;
    var width = win.width - padding;

    return {
      width: width,
      height: width * aspect
    };
  }

  getSource() {
    var html = this.props.embed.html;
    var uri = this.getSourceUri(html);
    return uri
      ? { uri: uri }
      : { html: html };
  }

  getSourceUri(html) {
    debug('get source uri', html);
    var result = /iframe[^>]+src=\"([^"]+)/.exec(html);
    return result && result[1];
  }

  renderLoading() {
    var webviewSize = this.getWebViewSize();
    return <ProgressBarAndroid style={[styles.loading, {
      paddingTop: webviewSize.height - 50
    }]} styleAttr="Normal"/>
  }

  render() {
    debug('render');
    var webviewSize = this.getWebViewSize();
    var source = this.getSource();

    // Height 100% seems to be broken in Android WebView
    // meaning some web-apps appear completely collapsed.
    var injectedScript = 'document.body.style.minHeight = \'' + (webviewSize.height + 'px') + '\';';

    return (
      <View style={[styles.root, {
        width: webviewSize.width,
        height: webviewSize.height
        }]}>
        <WebView
          ref="webview"
          style={[styles.webview, {
            width: webviewSize.width,
            height: webviewSize.height
          }]}
          injectedJavaScript={injectedScript}
          renderLoading={this.renderLoading}
          source={source}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>
    );
  }
}

ContentEmbed.propTypes = {
  url: React.PropTypes.string,
  embed: React.PropTypes.object
};

/**
 * Exports
 */

module.exports = ContentEmbed;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },

  webview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  loading: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
