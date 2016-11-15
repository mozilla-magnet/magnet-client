'use strict';

/**
 * Dependencies
 */

const LinearGradient = require('react-native-linear-gradient').default;
const debug = require('../../debug')('ListItem');
const theme = require('../../../config').theme;
const tinycolor = require('tinycolor2');
const React = require('react');

/**
 * Locals
 */

const {
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  View,
} = require('react-native');

/**
 * The ListItem class
 *
 * @public
 * @type {Class}
 */
class ListItem extends React.Component {
  constructor(props) {
    super(props);
    this.onPress = this.onPress.bind(this);
    debug('created');
  }

  shouldComponentUpdate(nextProps) {
    if (this.dragging) return false;
    return nextProps.item !== this.props.item
      || nextProps.showDistance !== this.props.showDistance
      || nextProps.item.distance !== this.props.item.distance;
  }

  render() {
    var item = this.props.item.value;
    debug('render', item);
    var style = [
      styles.root,
      this.props.style,
    ];

    return (
      <TouchableOpacity
        style={style}
        onPress={this.onPress}
        >
        {this.renderContent(item)}
      </TouchableOpacity>
    );
  }

  renderContent(item) {
    var metadata = item.metadata || {};
    var h1 = metadata.title || item.url;
    var h2 = metadata.url || 'fetching content \u2026';
    var gradient = metadata.image
      ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']
      : ['transparent', 'transparent'];

    return (
      <View
        style={styles.content}
        testId="inner">
        {this.renderBackground(item)}
        {this.renderDistance(item)}
        <LinearGradient style={styles.text} colors={gradient}>
          <View style={styles.h1}>
            <Text
              style={[styles.textNode, styles.h1Node]}
              numberOfLines={1}>{h1}</Text>
          </View>
          <View>
            <Text
              style={[styles.textNode, styles.h2Node]}
              numberOfLines={1}>{h2}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  renderDistance({ distance }) {
    debug('render distance', distance);
    var ignore = !distance
      || !this.props.showDistance
      || distance === Infinity
      || distance === -1;

    if (ignore) return;
    var text = `${distance}m`;

    return <View style={styles.distance}>
      <Text style={[
        styles.textNode,
        styles.distanceText,
      ]}>{text}</Text>
    </View>;
  }

  renderBackground(item) {
    const metadata = item.metadata || {};
    const content = metadata.image
      ? this.renderBackgroundImage(metadata)
      : this.renderBackgroundFallback(metadata);

    return <View style={[styles.background]}>{content}</View>;
  }

  renderBackgroundImage({ image }) {
    return <Image
      style={[styles.backgroundImage]}
      resizeMode="cover"
      source={{ uri: image }}/>;
  }

  renderBackgroundFallback({ title = '', themeColor = theme.colorPrimary }) {
    var backgroundColor = tinycolor(themeColor).setAlpha(0.8);
    var color = 'rgba(255,255,255,0.2)';

    return <View style={[styles.backgroundFallback, { backgroundColor }]}>
      <Text style={[
        styles.backgroundFallbackText,
        { color },
      ]}>{title}</Text>
    </View>;
  }

  onPress() {
    this.props.onPress(this.props.item.id);
  }
}

ListItem.propTypes = {
  item: React.PropTypes.object,
  showDistance: React.PropTypes.bool,
  onPress: React.PropTypes.func,
  style: View.propTypes.style,
};

/**
 * Exports
 */

module.exports = ListItem;

/**
 * Component's stylesheet
 *
 * @type {StyleSheet}
 */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },

  content: {
    position: 'relative',
    flex: 1,
    height: 190,
    backgroundColor: '#fff',

    // android
    elevation: 0.7,

    // ios
    shadowOffset: { width: 0, height: 0.7 },
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 0,
  },

  background: {
    flex: 1,
    opacity: 0.9,
  },

  backgroundImage: {
    flex: 1,
  },

  backgroundFallback: {
    flex: 1,
    flexDirection: 'row',
  },

  backgroundFallbackText: {
    fontFamily: theme.fontLightItalic,
    fontSize: 190,
    marginLeft: 6,
    marginTop: -42,
  },

  distance: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 11,
    paddingTop: 7,
  },

  distanceText: {
    fontSize: 11,
    opacity: 0.8,
  },

  text: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 13,
    paddingBottom: 13,
    paddingTop: 21,
  },

  h1: {
    // marginTop: -6,
    marginBottom: -3,
  },

  h1Node: {
    fontSize: 23,
    // paddingBottom: 6,
    // backgroundColor: 'red',
  },

  h2Node: {
    fontSize: 11,
    lineHeight: 15,
  },

  /**
   * Utils
   */

  textNode: {
    color: '#fff',
    fontFamily: theme.fontLightItalic,
    backgroundColor: 'transparent',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 3,
    textShadowOffset: {
      width: 0,
      height: 1,
    },
  },
});
