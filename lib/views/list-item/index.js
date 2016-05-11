'use strict';

/**
 * Dependencies
 */

var debug = require('../../debug')('ListItem');
var ContentViewStatic = require('./content/static');
var ContentViewEmbed = require('./content/embed');
var ReactNative = require('react-native');
var React = require('react');

/**
 * Locals
 */

var {
  Linking,
  StyleSheet,
  PanResponder,
  Animated,
  Text,
  View
} = ReactNative;

/**
 * Swipe velocity must exceed this
 * speed for list-items to swipe away,
 * else they spring back.
 *
 * @type {Number}
 */
const SWIPE_VELOCITY_THRESHOLD = 0.8;

var contentViews = {
  static: ContentViewStatic,
  embed: ContentViewEmbed
};

class ListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pan: new Animated.ValueXY()
    };

    this.tapHandlers = this.createTapHandlers();
    debug('created');
  }

  componentWillMount() {
    debug('component will mount')
    this.panResponder = this.createPanResponder();
  }

  render() {
    debug('render');
    var panHandlers = this.panResponder.panHandlers;
    var pan = this.state.pan;
    var translateX = pan.x;
    var opacity = pan.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: [0.5, 1, 0.5]
    });

    return (
      <Animated.View
        {...panHandlers}
        style={[styles.root, { transform: [{ translateX }], opacity }]}
        onLayout={this.onLayout.bind(this)}>
          <Text style={styles.url} numberOfLines={1}>{this.props.url}</Text>
          <View {...this.tapHandlers} style={styles.content} testId="inner">
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

  createPanResponder() {
    debug('setup swipable');
    return PanResponder.create({
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder.bind(this),
      onPanResponderGrant: this.onPanResponderGrant.bind(this),
      onPanResponderMove: Animated.event([
        null, { dx: this.state.pan.x, dy: this.state.pan.y }
      ]),

      onPanResponderRelease: this.onPanResponderRelease.bind(this),
      onPanResponderTerminate: this.onPanResponderTerminate.bind(this),
      onShouldBlockNativeResponder: () => true
    });
  }

  onMoveShouldSetPanResponder(e, { dx, dy }) {
    debug('panresponder move should set?', dx, dy);
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
    debug('on pan responser release');
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
    if (exceededThreshold) this.swipeAway(vx)
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
    if (this.getType() == 'embed') return;
    this.navigateToUrl();
  }

  createTapHandlers() {
    debug('create tap handlers');
    var self = this;

    return {
      onStartShouldSetResponder() { return true },
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

  getType() {
    return this.props.embed
      ? 'embed'
      : 'static'
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
      if (Math.abs(x) < (this.width + 14)) return;
      debug('swiped away', x, velocity);
      this.state.pan.removeListener(listener);
      this.state.pan.stopAnimation();
      this.props.onSwiped(this);
    });
  }

  navigateToUrl() {
    debug('go to url', this.props.url);
    Linking.openURL(this.props.url);
  }
}

ListItem.propTypes = {
  id: React.PropTypes.number,
  url: React.PropTypes.string,
  embed: React.PropTypes.object,
  onLongPress: React.PropTypes.func,
  onGestureStart: React.PropTypes.func,
  onGestureEnd: React.PropTypes.func,
  onSwiped: React.PropTypes.func
};

function clamp(value, lower, upper) {
  return Math.max(Math.min(value, upper), lower);
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingBottom: 18
  },

  url: {
    marginBottom: 7,
    textAlign: 'center',
    fontFamily: 'FiraSans-BookItalic',
    color: '#c1c1c1',
    fontSize: 11
  },

  content: {}
});
