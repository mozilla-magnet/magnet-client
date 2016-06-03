
/**
 * Dependencies
 */

var debug = require('../../../debug')('ContentViewEmbed');
var WebView = require('../../magnet-web-view');
var ReactNative = require('react-native');
var React = require('react');

/**
 * Locals
 */

var {
  StyleSheet,
  Dimensions,
  View,
  ProgressBarAndroid
} = ReactNative;

/**
 * The maximum height that we'll
 * render an embedded tile.
 *
 * @type {Number}
 */
const MAX_HEIGHT = 450;

/**
 * Default initial height used if we're
 * unable to derive one from oembed data.
 *
 * @type {Number}
 */
const DEFAULT_HEIGHT = 180;

/**
 * The base url used when rendering
 * html given by an oembed.
 *
 * AFAIK the base URL is arbitrary.
 * Saying that, we could run into
 * cross-origin issues. We should
 * probably set the base URL to
 * match the source URL.
 *
 * @type {String}
 */
const BASE_URL = 'http://tengam.org';

class ContentViewEmbed extends React.Component {
  constructor(props) {
    super(props);
    this.renderLoading = this.renderLoading.bind(this);

    var width = this.getWidth();
    this.state = {
      width: width,
      height: this.getHeight(width)
    };

    debug('created');
  }

  /**
   * Render called whenever `this.state`
   * or `this.props` change.
   *
   * We must set the `width` and `height`
   * on the webview so that the inner
   * native webview can MATCH_PARENT
   * width and height. `flex: 1` doesn't
   * seem to do the job here.
   *
   * @return {ReactComponent}
   */
  render() {
    var source = this.getSource();
    var pointerEvents = this.props.expanded
      ? 'auto'
      : 'none';

    debug('render', source, pointerEvents);

    return (
      <View
        style={styles.root}
        pointerEvents={pointerEvents}>
        <WebView
          ref="webview"
          source={source}
          scrollEnabled={false}
          onLoaded={this.onLoaded.bind(this)}
          style={[styles.webview,  {
            height: this.state.height,
            width: this.state.width
          }]}
        />
      </View>
    );
  }

  getWidth() {
    var win = Dimensions.get('window');
    var padding = 11 * 2;
    return win.width - padding;
  }

  getHeight(width) {
    var embed = this.props.embed;
    var aspect = embed.height / embed.width;
    return Math.round(width * aspect) || DEFAULT_HEIGHT;
  }

  // TODO: needs unit-tests
  setHeight(height) {
    debug('set height', height);
    if (height > MAX_HEIGHT) return;
    if (height < DEFAULT_HEIGHT) return;
    this.setState({ height: height });
    debug('height set', height);
  }

  /**
   * Extract the best source for the web-view
   * from the provided `embed` data.
   *
   * A source can either be an
   * html string or a URI.
   *
   * @return {Object}
   */
  getSource() {
    var html = this.props.embed.html;
    var uri = this.getSourceUri(html);

    return uri
      ? { uri: uri }
      : { html: documentize(html), baseUrl: BASE_URL };
  }

  /**
   * Many oembed `html` strings just
   * contain an iframe. We get a lot
   * more control over the content
   * when it's not in an iframe and
   * our web-view is effectively an
   * iframe anyway.
   *
   * There is some risk to this strategy
   * is that some content providers may
   * not allow embedding unless they can
   * detect it's in an iframe (google maps)
   * is an example of this. Or an <iframe>
   * may be an insignificant part of the
   * overall embed, meaning brokenness.
   *
   * Only time will tell.
   *
   * @param  {String} html
   * @return {(String|undefined)}
   */
  getSourceUri(html) {
    debug('get source uri');
    var result = /<iframe ([^>]+)>/.exec(html);
    var attrs = result && result[1];

    if (!attrs) return;

    // if iframes are required for embed to
    // function (eg. google maps embeds), then
    // they can be flagged so magnet doesn't attempt
    // to load the src directly in the webview
    var required = /data-magnet-required/.test(attrs);
    if (required) return;

    var src = /src=["'](.+)["']/.exec(attrs);
    return src && src[1];
  }

  renderLoading() {
    var webviewSize = this.getWebViewSize();
    return <ProgressBarAndroid style={[styles.loading, {
      paddingTop: webviewSize.height - 50
    }]} styleAttr="Normal"/>
  }

  /**
   * Once the webview has loaded we
   * set the height to match the
   * html content height.
   *
   * @param  {Number} options.height
   */
  onLoaded({ height }) {
    debug('on webview loaded', height);
    this.setHeight(height);
  }
}

/**
 * Defines the properties passed to
 * this component that are used.
 *
 * @type {Object}
 */
ContentViewEmbed.propTypes = {
  url: React.PropTypes.string,
  embed: React.PropTypes.object,
  expanded: React.PropTypes.bool,
};

/**
 * Exports
 */

module.exports = ContentViewEmbed;

/**
 * CSS-like styles that are applied
 * to specific elements inline.
 *
 * @type {Object}
 */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },

  webview: {
    flex: 1
  },

  loading: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

/**
 * Utils
 */

/**
 * Oembed HTML is usually just an HTML
 * snippet without a containing document.
 * This function is used to wrap incoming
 * snippets before they get injected into
 * a web-view.
 *
 * We make a crude check to make sure the
 * snippet doesn't include a documentElement
 * before wrapping it.
 *
 * @param  {String} html
 * @return {String}
 */
function documentize(html) {

  // if the html already has a
  // document wrapper don't wrap it again
  if (/<html/.test(html)) return html;

  return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <style>
        html,
        body {
          margin: 0;
          height: 100%;
        }

        iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
      </style>
    </head>
    <body>${html}</body>
    </html>`;
}
