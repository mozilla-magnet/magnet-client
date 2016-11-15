'use strict';

/**
 * Dependencies
 */

const debug = require('../../debug')('ItemDetail');
const theme = require('../../../config').theme;
const ReactNative = require('react-native');
const tinycolor = require('tinycolor2');
const React = require('react');

const {
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Image,
  View,
  Text,
} = ReactNative;

const {
  INCOMPLETE,
  ERROR,
} = require('../../store/constants');

class ItemDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { animating: true };
    debug('created');
  }

  render() {
    return (
      <ScrollView style={styles.root}>
        {this.renderContent(this.props.item)}
        {this.renderHeader()}
      </ScrollView>
    );
  }

  renderContent(item) {
    if (!item || item.status === INCOMPLETE) return this.renderLoading();
    if (item.status === ERROR) return this.goBack();
    const { metadata } = item.value;
    return <View>
      {this.renderMedia(metadata)}
      {this.renderUrlBar(metadata)}
      {this.renderText(metadata)}
    </View>;
  }

  renderLoading() {
    return <View style={styles.loading}>
      <ActivityIndicator
        animating={true}
        color={theme.colorPrimary}
        size="large"/>
    </View>;
  }

  renderMedia({ image, title, themeColor }) {
    debug('render media', image, title, themeColor);
    if (image) return this.renderMediaImage(image);
    else return this.renderMediaFallback(title, themeColor);
  }

  renderMediaImage(image) {
    return (
      <View style={styles.mediaImage}>
        <Image
          style={styles.mediaImageNode}
          resizeMode="cover"
          source={{ uri: image }}/>
      </View>
    );
  }

  renderMediaFallback(title, themeColor = theme.colorPrimary) {
    const backgroundColor = tinycolor(themeColor).setAlpha(0.8);
    const color = 'rgba(255,255,255,0.5)';

    return (
      <View style={[styles.mediaFallback, { backgroundColor }]}>
        <Text style={[styles.mediaFallbackTextNode, { color }]}>{title}</Text>
      </View>
    );
  }

  renderUrlBar({ url }) {
    return (
      <View style={styles.urlBar}>
        <Text style={styles.url}>{url}</Text>
      </View>
    );
  }

  renderText({ title, description, url, siteName = 'website' }) {
    return (
      <View style={styles.text}>
        <View><Text style={styles.title}>{title}</Text></View>
        <View><Text style={styles.description}>{description}</Text></View>
        <View>
          <Text
            style={styles.visitButton}
            onPress={this.onVisitWebsite.bind(this, url)}>Visit {siteName}</Text>
        </View>
      </View>
    );
  }

  onVisitWebsite(url) {
    Linking.openURL(url);
  }

  renderDistance(distance = 0) {
    distance = Math.round(distance);
    let label = `${distance} metres away`;

    if (distance === 1) {
      label = '1 metre away';
    }

    return (
      <View style={styles.distance}>
        <Image
          style={styles.distanceImage}
          source={require('../../images/item-scene-room.png')}/>
        <Text>{label}</Text>
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
            source={require('../../images/item-scene-close.png')}/>
        </TouchableOpacity>
      </View>
    );
  }

  onClosePress() {
    this.goBack();
  }

  goBack() {
    this.props.navigator.pop();
  }
}

ItemDetail.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  item: React.PropTypes.object,
};

/**
 * Exports
 */

module.exports = ItemDetail;

const VERTICAL_MARGIN = 20;

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    position: 'absolute',
    left: 0,
    top: 0,
  },

  close: {
    padding: 16,
  },

  closeImage: {
    width: 20,
    height: 20,
  },

  mediaImage: {
    height: 220,
  },

  mediaImageNode: {
    height: 220,
  },

  mediaFallback: {
    height: 220,
    overflow: 'hidden',
    paddingLeft: 16,
  },

  mediaFallbackTextNode: {
    width: 1200,
    fontFamily: 'FiraSans-LightItalic',
    fontSize: 180,
    marginTop: -40,
  },

  urlBar: {
    paddingHorizontal: 16,
    paddingTop: -5 + VERTICAL_MARGIN,
    borderTopColor: '#EEE',
    borderTopWidth: 1,
  },

  url: {
    color: '#999',
    fontFamily: 'FiraSans-LightItalic',
    fontSize: 14,
  },

  text: {
    marginTop: -13 + VERTICAL_MARGIN,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 31,
    fontFamily: 'FiraSans-LightItalic',
    color: '#4D4D4D',
  },

  description: {
    marginTop: -13 + VERTICAL_MARGIN,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'FiraSans-Book',
    color: '#999',
  },

  visitButton: {
    marginTop: -3 + VERTICAL_MARGIN,
    marginBottom: VERTICAL_MARGIN,
    padding: 10,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'FiraSans-Book',
    color: '#999',
    backgroundColor: 'lightgrey',
  },

  distance: {
    flexDirection: 'row',
    marginHorizontal: 10,
  },

  distanceImage: {
    width: 20,
    height: 20,
    marginRight: 5,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
