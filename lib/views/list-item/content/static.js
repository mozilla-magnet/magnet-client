
/**
 * Dependencies
 */

var debug = require('../../../debug')('ContentViewStatic');
var ReactNative = require('react-native');
var tinycolor = require('tinycolor2');
var React = require('react');

/**
 * Locals
 */

var {
  StyleSheet,
  Text,
  View,
  Image,
} = ReactNative;

var TITLE_LINE_HEIGHT = 32;
var PADDING_HORIZONTAL = 18;

class ContentViewStatic extends React.Component {
  constructor(props) {
    super(props);
    this.state = { titleLineCount: 1 };
    debug('created');
  }

  /**
   * Optimization to prevent component
   * unnecessarily re-rendering.
   *
   * If we expect component data-model
   * to change we should make this
   * check smarter.
   *
   * @return {Boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.titleLineCount !== nextState.titleLineCount;
  }

  render() {
    debug('render');
    this.icon = this.getIcon();

    return (
      <View
        style={styles.root}>
        {this.renderRow1()}
        <View style={styles.row2}>
          {this.renderIcon()}
          {this.renderTitle()}
        </View>
        <View style={styles.description}>
          <Text
            style={styles.descriptionText}
            numberOfLines={5}>
            {this.props.description}</Text>
        </View>
      </View>
    );
  }

  renderRow1() {
    return <View>
      {this.renderColorBar()}
      {this.renderImage()}
    </View>
  }

  renderColorBar() {
    var color = this.props.theme_color || '#00A2D4';
    var lighter = tinycolor(color).setAlpha(0.5);
    var height = this.getColorBarHeight();

    debug('render color bar');

    return <View style={{
      height: height,
      backgroundColor: lighter
    }}/>
  }

  renderImage() {
    if (!this.props.image) return;
    debug('image', this.props.image);
    return <Image
      style={styles.image}
      resizeMode="cover"
      source={{ uri: this.props.image}}/>
  }

  renderTitle() {
    return (
      <View style={styles.title}>
        <Text
          testId="title-text"
          style={styles.titleText}
          onLayout={this.onLayoutTitle.bind(this)}>
          {this.props.title.trim()}</Text>
      </View>
    );
  }

  renderIcon() {
    if (!this.icon) return;
    var marginTop = this.getIconMarginTop();
    debug('render icon', this.icon, marginTop);

    return (
      <View
        testId="icon"
        style={[styles.icon, { marginTop }]}>
        <Image
          style={styles.iconNode}
          source={{ uri: this.icon}}/>
      </View>
    );
  }

  getColorBarHeight() {
    if (this.props.image) return 0;
    else if (this.icon) return 36;
    else return 12;
  }

  /**
   * Get the icon URI if valid.
   *
   * We ignore low res .ico icons
   * to maintain visual quality.
   *
   * @return {(String|undefined)}
   */
  getIcon() {
    var icon = this.props.icon;
    if (!icon) return;
    if (~icon.indexOf('.ico')) return;
    return icon;
  }

  getIconMarginTop() {
    return this.state.titleLineCount > 1 ? 16 : 0
  }

  onLayoutTitle({nativeEvent:{layout:{height}}}) {
    var titleLineCount = height / TITLE_LINE_HEIGHT;
    debug('on title layout', height, titleLineCount);
    this.setState({ titleLineCount });
  }

}

ContentViewStatic.propTypes = {
  unadaptedUrl: React.PropTypes.string,
  url: React.PropTypes.string,
  title: React.PropTypes.string,
  description: React.PropTypes.string,
  icon: React.PropTypes.string,
  image: React.PropTypes.string,
  theme_color: React.PropTypes.string,
  expanded: React.PropTypes.bool
};

/**
 * Exports
 */

module.exports = ContentViewStatic;

var styles = StyleSheet.create({
  root: {
    backgroundColor: 'white',
    paddingBottom: 14,

    // android
    elevation: 0.7,

    // ios
    shadowOffset: { width: 0, height: 0.7 },
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 0,
  },

  image: {
    flex: 1,
    height: 160
  },

  row2: {
    marginTop: -24,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: PADDING_HORIZONTAL,
    marginBottom: 10
  },

  icon: {
    width: 70,
    height: 70,
    marginRight: 14,
    marginLeft: -2,
    borderRadius: 35,
    backgroundColor: '#fff'
  },

  iconNode: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#f2f2f2'
  },

  title: {
    flex: 1,
    marginTop: 24,
    paddingTop: 10,
    justifyContent: 'center'
  },

  titleText: {
    fontSize: 25,
    lineHeight: TITLE_LINE_HEIGHT,
    color: '#595858',
    fontFamily: 'FiraSans-LightItalic'
  },

  description: {
    marginHorizontal: PADDING_HORIZONTAL
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#828080',
    fontFamily: 'FiraSans-Book'
  }
});