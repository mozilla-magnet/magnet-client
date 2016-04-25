
/**
 * Dependencies
 */

var debug = require('../../../debug')('ContentSimple');
var tinycolor = require('tinycolor2');
var React = require('react-native');

/**
 * Locals
 */

var {
  Component,
  StyleSheet,
  Text,
  View,
  Image
} = React;

class ContentSimple extends Component {
  constructor(props) {
    super(props);
    debug('created');
  }

  render() {
    debug('render');

    return (
      <View style={styles.root}>
        {this.renderRow1()}
        <View style={styles.row2}>
          {this.renderIcon()}
          {this.renderTitle()}
          <Text style={styles.description}>{this.props.description}</Text>
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
    var lighter = tinycolor(color).lighten(38);
    var height = this.getColorBarHeight();

    return <View style={{
      height: height,
      backgroundColor: lighter
    }}/>
  }

  getColorBarHeight() {
    return !this.props.image && this.props.icon
      ? 36
      : 12
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
    var marginLeft = this.props.icon ? 77 : 0
    return <Text
      style={[styles.title, { marginLeft: marginLeft }]}
      >{this.props.title.trim()}</Text>
  }

  renderIcon() {
    if (!this.props.icon) return;
    debug('icon', this.props.icon);
    return <View style={styles.icon}>
      <Image
        style={styles.iconNode}
        source={{ uri: this.props.icon}}/>
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
    paddingTop: 11,
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