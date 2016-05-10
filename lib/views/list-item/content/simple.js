
/**
 * Dependencies
 */

var debug = require('../../../debug')('ContentSimple');
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
  Image
} = ReactNative;

class ContentSimple extends React.Component {
  constructor(props) {
    super(props);
    debug('created');
  }

  render() {
    debug('render');
    this.icon = this.getIcon();

    return (
      <View style={styles.root}>
        {this.renderRow1()}
        <View style={styles.row2}>
          {this.renderIcon()}
          {this.renderTitle()}
          <Text
            style={styles.description}
            numberOfLines={5}
            >{this.props.description}</Text>
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
    var color = this.props.theme_color || 'grey';
    var lighter = tinycolor(color).setAlpha(0.5);
    var height = this.getColorBarHeight();

    debug('render color bar', color, lighter, height);

    return <View style={{
      height: height,
      backgroundColor: lighter
    }}/>
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

  renderImage() {
    if (!this.props.image) return;
    debug('image', this.props.image);
    return <Image
      style={styles.image}
      resizeMode="cover"
      source={{ uri: this.props.image}}/>
  }

  renderTitle() {
    var marginLeft = this.icon ? 77 : 0
    return <Text
      style={[styles.title, { marginLeft: marginLeft }]}
      >{this.props.title.trim()}</Text>
  }

  renderIcon() {
    if (!this.icon) return;
    debug('icon', this.icon);
    return <View style={styles.icon}>
      <Image
        style={styles.iconNode}
        source={{ uri: this.icon}}/>
      </View>
  }
}

ContentSimple.propTypes = {
  url: React.PropTypes.string,
  title: React.PropTypes.string,
  description: React.PropTypes.string,
  icon: React.PropTypes.string,
  image: React.PropTypes.string,
  theme_color: React.PropTypes.string
};

/**
 * Exports
 */

module.exports = ContentSimple;

var styles = StyleSheet.create({
  root: {
    backgroundColor: 'white'
  },

  image: {
    flex: 1,
    height: 160
  },

  row2: {
    position: 'relative',
    paddingHorizontal: 21,
    paddingTop: 12,
    paddingBottom: 18
  },

  icon: {
    position: 'absolute',
    top: -24,
    left: 14,
    width: 70,
    height: 70,
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
    fontSize: 26,
    marginBottom: 8,
    fontFamily: 'FiraSans-LightItalic',
    color: '#595858'
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#828080',
    fontFamily: 'FiraSans-Book'
  }
});