'use strict';

/**
 * Dependencies
 */

const Metrics = require('../../utils/metrics').Metrics;
var ContentViewStatic = require('./content/static');
var ContentViewEmbed = require('./content/embed');
var debug = require('../../debug')('ListItem');
var ReactNative = require('react-native');
var React = require('react');

/**
 * Locals
 */

var {
  PanResponder,
  StyleSheet,
  Animated,
  Linking,
  Text,
  View
} = ReactNative;

/**
 * Margin either size of the list item.
 *
 * @type {Number}
 */
const MARGIN_HORIZONTAL = 11;

/**
 * Swipe velocity must exceed this
 * speed for list-items to swipe away,
 * else they spring back.
 *
 * @type {Number}
 */
const SWIPE_VELOCITY_THRESHOLD = 0.8;

/**
 * List item content can be either
 * a static (native) tile, or an
 * HTML webview embed, defined by
 * any 'oembed' metadata found.
 *
 * @type {Object}
 */
var contentViews = {
  static: ContentViewStatic,
  embed: ContentViewEmbed
};

/**
 * The ListItem class
 *
 * @public
 * @type {Class}
 */
class ListItem extends React.Component {
  constructor(props) {
    super(props);

    var pan = new Animated.ValueXY();
    var opacity = pan.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: [0.5, 1, 0.5]
    });

    this.state = {
      pan: pan,
      opacity: opacity
    };

    this.panHandlers = this.createPanHandlers();
    this.tapHandlers = this.createTapHandlers();
    debug('created');
  }

  render() {
    debug('render');
    var opacity = this.state.opacity;
    var pan = this.state.pan;
    var translateX = pan.x;

    // only add gestures when collapsed
    var panHandlers = !this.props.expanded
      ? this.panHandlers
      : null;

    return (
      <Animated.View
        {...panHandlers}
        style={[styles.root, { transform: [{ translateX }], opacity }]}
        onLayout={this.onLayout.bind(this)}>
        <View style={styles.url}>
          <Text
            style={styles.urlText}
            numberOfLines={1}>
            {this.props.displayUrl}
          </Text>
        </View>
        <View
          {...this.tapHandlers}
          style={styles.content}
          testId="inner">
          {this.renderContentView()}
        </View>
      </Animated.View>
    );
  }

  renderContentView() {
    var type = this.getType();
    var ContentView = contentViews[type];
    return <ContentView {...this.props}/>
  }

  createTapHandlers() {
    debug('create tap handlers');
    var self = this;

    return {

      // Static tiles should always have
      // the repsonder set so that they
      // can respond to taps. For embed
      // tiles we don't want to set the
      // responder when expanded as it can
      // interfere with webview touch events.
      onStartShouldSetResponder() {
        return self.isStatic() || !self.isExpanded();
      },

      onResponderGrant({nativeEvent}) {
        self.tapStart = getTime(nativeEvent);
        debug('on responser grant', nativeEvent);
      },

      onResponderRelease({nativeEvent}) {
        var time = getTime(nativeEvent) - self.tapStart;
        var tapped = time < 250;
        debug('on responser release', time, tapped);
        if (tapped) self.onTapped();
        self.tapStart = null
      },

      onResponderTerminationRequest() { return true; },
      onResponderTerminate() { self.tapStart = null; }
    };
  }

  createPanHandlers() {
    debug('create pan handlers');
    return PanResponder.create({
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder.bind(this),
      onPanResponderGrant: this.onPanResponderGrant.bind(this),
      onPanResponderMove: Animated.event([
        null, { dx: this.state.pan.x, dy: this.state.pan.y }
      ]),

      onPanResponderRelease: this.onPanResponderRelease.bind(this),
      onPanResponderTerminate: this.onPanResponderTerminate.bind(this),
      onPanResponderTerminationRequest: () => {
        debug('pan responder terminate?');
      },
      onShouldBlockNativeResponder: () => true
    }).panHandlers;
  }

  onMoveShouldSetPanResponder(e, { dx, dy }) {
    debug('panresponder move should set?', dx, dy);
    if (this.props.expanded) return false;

    var isPan = Math.abs(dx) > 6;
    var isScroll = Math.abs(dy) > 5;
    debug('pan: %s, scroll: %s', isPan, isScroll);
    return isPan && !isScroll;
  }

  onPanResponderGrant() {
    debug('panresponder move');
    this.props.onGestureStart();
  }

  onPanResponderRelease(e, gesture) {
    debug('panresponser release');
    this.onGestureEnd(e, gesture);
  }

  onPanResponderTerminate(e, gesture) {
    debug('panresponder terminate');
    this.onGestureEnd(e, gesture);
  }

  onGestureEnd(e, {vx}) {
    var exceededThreshold = Math.abs(vx) > SWIPE_VELOCITY_THRESHOLD;
    debug('gesture end', vx, exceededThreshold);

    // fast swipes fling the tile away
    if (exceededThreshold) {
      this.swipeAway(vx);
    }
    else this.snapBack();

    // indicate to the list view that
    // it can become scrollable again
    if (this.props.onGestureEnd) this.props.onGestureEnd();
  }

  onLayout({nativeEvent:{layout}}) {
    debug('on layout');
    this.height = layout.height;
    this.width = layout.width;
  }

  onTapped() {
    debug('on tapped');

    // bubble the event up the tree when not expanded
    // to allow accestors to handle the event
    if (this.isEmbed() || !this.isExpanded()) {
      this.props.onPressed(this);
      return;
    }

    // only expanded static tiles navigate when pressed
    this.navigateToUrl()
  }

  getType() {
    return this.props.embed
      ? 'embed'
      : 'static'
  }

  isExpanded() {
    return !!this.props.expanded;
  }

  isEmbed() {
    return this.getType() == 'embed';
  }

  isStatic() {
    return this.getType() == 'static';
  }

  snapBack() {
    return new Promise(resolve => {
      Animated.spring(this.state.pan, {
        toValue: { x: 0, y: 0 },
        friction: 7
      }).start(resolve);
    });
  }

  swipeAway(vx) {
    var min = 2;
    var max = 5;
    var velocity = vx >= 0
      ? clamp(vx, min, max)
      : clamp(vx * -1, min, max) * -1;

    debug('swiping away ...', vx, velocity);
    Metrics.swiped(this.props.unadaptedUrl);
    Animated.decay(this.state.pan, {
      velocity: { x: velocity, y: 0 },
      deceleration: 0.9999
    }).start();

    // callback once the tile has left the viewport
    var listener = this.state.pan.addListener(({ x }) => {
      if (Math.abs(x) < (this.width + MARGIN_HORIZONTAL)) return;
      debug('swiped away', x, velocity);
      this.state.pan.removeListener(listener);
      this.state.pan.stopAnimation();
      this.props.onSwiped(this);
    });
  }

  /**
   * Navigate to the final url, after
   * redirects but before adaptors.
   *
   * This means we skip overhead of redirects
   * (eg. via shortened urls) and navigate
   * straight to the final url.
   *
   * @private
   */
  navigateToUrl() {
    debug('go to url', this.props.unadaptedUrl);
    Linking.openURL(this.props.unadaptedUrl);
  }
}

ListItem.propTypes = {
  id: React.PropTypes.number,
  unadaptedUrl: React.PropTypes.string,
  displayUrl: React.PropTypes.string,
  embed: React.PropTypes.object,
  onLongPress: React.PropTypes.func,
  onGestureStart: React.PropTypes.func,
  onGestureEnd: React.PropTypes.func,
  onSwiped: React.PropTypes.func,
  onPressed: React.PropTypes.func,
  expanded: React.PropTypes.bool,
};

/**
 * Clamp a number between a
 * given min/max range.
 *
 * @param  {Number} value
 * @param  {Number} min
 * @param  {Number} max
 * @return {Number}
 */
function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

/**
 * Extract the timestamp property
 * from a react-native event object.
 *
 * Depending on the platform this
 * key can have different names :(
 *
 * @param  {Object} nativeEvent
 * @return {Number}
 */
function getTime(nativeEvent) {
  return typeof nativeEvent.timestamp != 'undefined'
    ? nativeEvent.timestamp
    : nativeEvent.timeStamp;
}

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
    marginBottom: 7
  },

  url: {
    marginHorizontal: MARGIN_HORIZONTAL,
    marginVertical: 6
  },

  urlText: {
    textAlign: 'center',
    fontFamily: 'FiraSans-BookItalic',
    color: '#c1c1c1',
    fontSize: 11,
  },

  content: {
    backgroundColor: '#fff',
    marginHorizontal: MARGIN_HORIZONTAL,
    marginBottom: 1,

    // android
    elevation: 0.7,

    // ios
    shadowOffset: { width: 0, height: 0.7 },
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 0,
  }
});
