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
  PanResponder,
  StyleSheet,
  Animated,
  Image,
  Text,
  View
} = require('react-native');

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

  shouldComponentUpdate(nextProps) {
    return nextProps.item !== this.props.item;
  }

  render() {
    debug('render');
    var { item } = this.props;
    var opacity = this.state.opacity;
    var pan = this.state.pan;
    var translateX = pan.x;

    return (
      <Animated.View
        {...this.panHandlers}
        style={[styles.root, this.props.style, {
          transform: [{ translateX }],
          opacity
        }]}
        onLayout={this.onLayout.bind(this)}>
        {this.renderContent(item)}
      </Animated.View>
    );
  }

  renderContent(item) {
    var h1 = item.title || item.originalUrl;
    var h2 = item.unadaptedUrl || 'fetching content \u2026';
    var gradient = item.image
      ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']
      : ['transparent', 'transparent'];

    return (
      <View
        {...this.tapHandlers}
        style={styles.content}
        testId="inner">
        {this.renderBackground(item)}
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

  renderBackground(item) {
    const content = item.image
      ? this.renderBackgroundImage(item)
      : this.renderBackgroundFallback(item);

    return <View style={[styles.background]}>{content}</View>
  }

  renderBackgroundImage({ image }) {
    return <Image
      style={[styles.backgroundImage]}
      resizeMode="cover"
      source={{ uri: image }}/>
  }

  renderBackgroundFallback({ title, themeColor }) {
    var backgroundColor = tinycolor(themeColor || theme.colorPrimary).setAlpha(0.8);
    var color = 'rgba(255,255,255,0.2)';

    return <View style={[styles.backgroundFallback, { backgroundColor }]}>
      <Text style={[
        styles.backgroundFallbackText,
        { color }
      ]}>{title}</Text>
    </View>
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
        return true;
      },

      onResponderGrant() {
        self.tapStart = Date.now();
        debug('on responser grant');
      },

      onResponderRelease() {
        var time = Date.now() - self.tapStart;
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
    if (!this.props.swipable) return false;
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
    if (exceededThreshold) this.swipeAway(vx);
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
    this.props.onPress(this);
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
}

ListItem.propTypes = {
  item: React.PropTypes.object,
  onLongPress: React.PropTypes.func,
  onGestureStart: React.PropTypes.func,
  onGestureEnd: React.PropTypes.func,
  onSwiped: React.PropTypes.func,
  onPress: React.PropTypes.func,
  swipable: React.PropTypes.bool,
  style: View.propTypes.style,
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
    overflow: 'hidden',
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
    opacity: 0.9
  },

  backgroundImage: {
    flex: 1,
  },

  backgroundFallback: {
    flex: 1,
    flexDirection: 'row'
  },

  backgroundFallbackText: {
    fontFamily: theme.fontLightItalic,
    fontSize: 190,
    marginLeft: 6,
    marginTop: -42,
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
    marginBottom: -3
  },

  h1Node: {
    fontSize: 23,
    // paddingBottom: 6,
    // backgroundColor: 'red',
  },

  h2Node: {
    fontSize: 11,
    lineHeight: 15
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
    }
  },
});
