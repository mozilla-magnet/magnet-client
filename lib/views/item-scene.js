
/**
 * Dependencies
 */

const debug = require('../debug')('ItemScene');
const theme = require('../../config').theme;
const ReactNative = require('react-native');
const tinycolor = require('tinycolor2');
const React = require('react');

var {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Image,
} = ReactNative;

class ItemScene extends React.Component {
  constructor(props) {
    super(props);
    debug('created');
  }

  render() {
    const metadata = this.props.item.metadata || {};
    console.log('render', this.props.item);

    return (
      <View style={styles.root}>
        {this.renderMedia(metadata)}
        {this.renderText(metadata)}
        {this.renderHeader()}
      </View>
    );
  }

  renderHeader() {
    return (
      <View style={styles.header}>
        <TouchableOpacity
        testId="close-button"
        style={styles.close}
        onPress={this.onClosePress.bind(this)}>
          <Image
            style={styles.closeImage}
            source={require('../images/item-scene-close.png')}/>
        </TouchableOpacity>
      </View>
    );
  }

  renderMedia({ embed, image, title, themeColor }) {
    debug('render media', embed, image, title, themeColor);
    if (embed) return this.renderMediaEmbed(embed);
    else if (image) return this.renderMediaImage(image);
    else return this.renderMediaFallback(title, themeColor);
  }

  renderMediaEmbed() {
    return <Text>[EMBED]</Text>
  }

  renderMediaImage(image) {
    return (
      <View style={[styles.mediaImage]}>
        <Image
          style={styles.mediaImageNode}
          resizeMode="cover"
          source={{ uri: image }}/>
      </View>
    );
  }

  renderMediaFallback(title, themeColor = theme.colorPrimary) {
    var backgroundColor = tinycolor(themeColor).setAlpha(0.8);
    var color = 'rgba(255,255,255,0.5)';

    return (
      <View style={[styles.mediaFallback, { backgroundColor }]}>
        <Text style={[styles.mediaFallbackTextNode, { color }]}>{title}</Text>
      </View>
    );
  }

  renderText({ title, description, unadaptedUrl, distance }) {
    return (
      <View style={styles.text}>
        <View><Text style={styles.title}>{title}</Text></View>
        <View><Text style={styles.url}>{unadaptedUrl}</Text></View>
        <View><Text style={styles.description}>{description}</Text></View>
        <View><Text>{distance}</Text></View>
      </View>
    );
  }

  onClosePress() {
    this.props.navigator.pop();
  }
}

ItemScene.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  item: React.PropTypes.object.isRequired,
};

/**
 * Exports
 */

module.exports = ItemScene;

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    position: 'absolute',
    left: 0,
    top: 0
  },

  close: {
    padding: 16
  },

  closeImage: {
    width: 20,
    height: 20,
  },

  media: {},

  mediaImageNode: {
    height: 220
  },

  mediaFallback: {
    height: 200,
    overflow: 'hidden',
    paddingLeft: 16,
  },

  mediaFallbackTextNode: {
    width: 1200,
    fontFamily: 'FiraSans-LightItalic',
    fontSize: 180,
    marginTop: -40
  },

  text: {
    padding: 16,
    borderTopColor: '#EEE',
    borderTopWidth: 1
  },

  title: {
    fontSize: 31,
    fontFamily: 'FiraSans-LightItalic',
    color: '#4D4D4D',
  },

  url: {
    marginTop: 13,
    marginBottom: 17,
    color: '#BBB',
    fontFamily: 'FiraSans-LightItalic',
    fontSize: 14
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'FiraSans-Book',
    color: '#999'
  }
});
