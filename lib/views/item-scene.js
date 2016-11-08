/**
 * Dependencies
 */

const debug = require('../debug')('ItemScene');
const theme = require('../../config').theme;
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const actions = require('../store/actions');
const tinycolor = require('tinycolor2');
const React = require('react');

const {
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  Text,
  Image,
  Linking,
} = ReactNative;

class ItemScene extends React.Component {
  constructor(props) {
    super(props);
    debug('created');
  }

  componentDidMount() {
    // @todo We should only be watching the position for virtual beacons.
    this.props.startWatchingLocation();
  }

  componentWillUnmount() {
    this.props.stopWatchingLocation();
  }

  render() {
    const metadata = this.props.item.metadata || {};

    return (
      <ScrollView style={styles.root}>
        {this.renderMedia(metadata)}
        {this.renderUrlBar(metadata)}
        {this.renderText(metadata)}
        {this.renderDistance()}
        {this.renderHeader()}
      </ScrollView>
    );
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

  renderDistance() {
    let distance = this.props.item.distance;

    // No distance and no geographic coordinates
    if (typeof distance !== 'number' &&
      (typeof this.props.item.latitude !== 'number' ||
      typeof this.props.item.longitude !== 'number')) {
      return null;
    }

    // mDNS beacon
    if (distance === -1) {
      return null;
    }

    if (this.props.location.latitude === null ||
      this.props.location.longitude === null) {
      return null;
    }

    if (typeof distance !== 'number' &&
      typeof this.props.item.latitude === 'number' &&
      typeof this.props.item.longitude === 'number') {
      distance = this.computeDistance(this.props.location);
    }

    distance = Math.round(distance);

    let label = `${distance} metres away`;

    if (distance === 1) {
      label = '1 metre away';
    }

    return (
      <View style={styles.distance}>
        <Image
          style={styles.distanceImage}
          source={require('../images/item-scene-room.png')}/>
        <Text style={styles.distanceLabel}>{label}</Text>
      </View>
    );
  }

  computeDistance({ latitude, longitude }) {
    const beaconLatitude = this.props.item.latitude;
    const beaconLongitude = this.props.item.longitude;

    const deg2rad = (deg) => deg * (Math.PI / 180);

    const R = 6371; // Radius of the Earth in km.
    const dLat = deg2rad(beaconLatitude - latitude);
    const dLon = deg2rad(beaconLongitude - longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(latitude)) * Math.cos(deg2rad(beaconLatitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in km
    return R * c;
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

  onClosePress() {
    this.props.navigator.pop();
  }
}

ItemScene.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  item: React.PropTypes.object.isRequired,
  startWatchingLocation: React.PropTypes.func.isRequired,
  stopWatchingLocation: React.PropTypes.func.isRequired,
  location: React.PropTypes.object.isRequired,
};

/**
 * Takes the redux `state` (passed down by
 * the parent `Provider`) view and maps
 * specific properties onto the App's
 * `this.props` object.
 *
 * This means the app never touches the
 * redux state directly and prevents
 * hacky code being written.
 *
 * @param  {Object} state
 * @return {Object}
 */
function mapStateToProps(state) {
  return {
    location: state.location,
  };
}

/**
 * Maps the methods exported from `action-creators.js`
 * to `this.props.<ACTION_NAME>`.
 *
 * @param  {function} dispatch
 * @return {Object}
 */
function mapDispatchToProps() {
  return {
    startWatchingLocation: actions.startWatchingLocation,
    stopWatchingLocation: actions.stopWatchingLocation,
  };
}

/**
 * Exports
 */

module.exports = connect(mapStateToProps, mapDispatchToProps)(ItemScene);

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
    marginBottom: VERTICAL_MARGIN,
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
    padding: 10,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'FiraSans-Book',
    color: '#999',
    backgroundColor: 'lightgrey',
  },

  distance: {
    marginTop: -2,
    marginBottom: VERTICAL_MARGIN,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },

  distanceImage: {
    width: 20,
    height: 20,
    marginRight: 5,
  },

  distanceLabel: {
    fontFamily: theme.fontBook,
    color: '#333',
  },
});
