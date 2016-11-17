'use strict';

/**
 * Dependencies
 */

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';
import Mapbox, { MapView } from 'react-native-mapbox-gl';
import { computeDistance } from '../../utils/distance';
import { settings, theme } from '../../../config';
import tinycolor from 'tinycolor2';
import Debug from '../../debug';

import {
  startWatchingLocation,
  stopWatchingLocation,
} from '../../store/actions';

import {
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Image,
  View,
  Text,
} from 'react-native';

const {
  INCOMPLETE,
  ERROR,
} = require('../../store/constants');

const debug = Debug('ItemDetail');

Mapbox.setAccessToken(settings.mapboxAccessToken);

class ItemDetail extends Component {
  constructor(props) {
    super(props);
    this.state = { animating: true };
    debug('created');
  }

  componentDidMount() {
    // @todo We should only be watching the position for virtual beacons.
    // @see https://github.com/mozilla-magnet/magnet-scanner-ios/issues/9
    this.props.startWatchingLocation();
  }

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  componentWillUnmount() {
    this.props.stopWatchingLocation();
  }

  render() {
    return (
      <View style={styles.root}>
        {this.renderContent(this.props.item)}
        {this.renderHeader()}
      </View>
    );
  }

  renderContent(item) {
    if (!item || item.status === INCOMPLETE) return this.renderLoading();
    if (item.status === ERROR) return this.goBack();
    const { metadata } = item.value || {};
    return <ScrollView style={styles.scroller}>
      {this.renderMedia(metadata)}
      {this.renderUrlBar(metadata)}
      {this.renderText(metadata)}
      {this.renderDistance(item.value)}
      {this.renderMap(item.value)}
    </ScrollView>;
  }

  renderLoading() {
    return <View style={styles.loading}>
      <ActivityIndicator
        animating={true}
        color={theme.colorPrimary}
        size="large"/>
    </View>;
  }

  renderMedia({ image, title, themeColor } = {}) {
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

  renderUrlBar({ url } = {}) {
    return (
      <View style={styles.urlBar}>
        <Text style={styles.url}>{url}</Text>
      </View>
    );
  }

  renderText({ title, description, url, siteName = 'website' } = {}) {
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

  renderDistance(item = {}) {
    let distance = item.distance;
    const beaconLocation = item.location || {};

    // No distance and no geographic coordinates
    if (typeof distance !== 'number' &&
      (typeof beaconLocation.latitude !== 'number' ||
      typeof beaconLocation.longitude !== 'number')) {
      return null;
    }

    // mDNS beacon
    if (distance === -1) {
      return null;
    }

    // We don't have the user location (yet).
    if (this.props.location.latitude === null ||
      this.props.location.longitude === null) {
      return null;
    }

    if (typeof distance !== 'number' &&
      typeof beaconLocation.latitude === 'number' &&
      typeof beaconLocation.longitude === 'number') {
      distance = computeDistance(beaconLocation, this.props.location);
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
          source={{
            uri: 'ic_place',
          }}/>
        <Text style={styles.distanceLabel}>{label}</Text>
      </View>
    );
  }

  renderMap(item = {}) {
    const beaconLocation = item.location;

    if (!beaconLocation ||
      typeof beaconLocation.latitude !== 'number' ||
      typeof beaconLocation.longitude !== 'number') {
      return null;
    }

    return (
      <View
        style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialCenterCoordinate={{
            latitude: beaconLocation.latitude,
            longitude: beaconLocation.longitude,
          }}
          annotations={[{
            coordinates: [
              beaconLocation.latitude,
              beaconLocation.longitude,
            ],
            type: 'point',
            id: 'marker1',
            annotationImage: {
              source: {
                uri: 'ic_place',
              },
              height: 24,
              width: 24,
            },
          }]}
          initialZoomLevel={14}
          rotateEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          showsUserLocation={false}
          attributionButtonIsHidden={true}
          logoIsHidden={true}
        />
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
  navigator: PropTypes.object.isRequired,
  item: PropTypes.object,
  startWatchingLocation: PropTypes.func.isRequired,
  stopWatchingLocation: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

/**
 * Takes the redux `store` (passed down by
 * the parent `Provider`) view and maps
 * specific properties onto the App's
 * `this.props` object.
 *
 * This means the app never touches the
 * redux store directly and prevents
 * hacky code being written.
 *
 * @param  {ReduxStore} store
 * @return {Object}
 */
function mapStateToProps(store) {
  return {
    location: store.location,
  };
}

/**
 * Maps the methods exported from `action.js`
 * to `this.props.<ACTION_NAME>`.
 *
 * @param  {function} dispatch
 * @return {Object}
 */
function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators({
      startWatchingLocation,
      stopWatchingLocation,
    }, dispatch),
  };
}

/**
 * Exports
 */

module.exports = connect(mapStateToProps, mapDispatchToProps)(ItemDetail);

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

  scroller: {
    flex: 1,
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
    paddingHorizontal: 16,
    flexDirection: 'row',
  },

  distanceImage: {
    width: 24,
    height: 24,
    marginRight: 5,
  },

  distanceLabel: {
    fontFamily: theme.fontBook,
    color: '#333',
  },

  mapContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: -3 + VERTICAL_MARGIN,
    marginBottom: VERTICAL_MARGIN,
    marginHorizontal: 16,
    height: 200,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
  },
});
