
/**
 * Dependencies
 */

var debug = require('../debug')('HeaderBar', 1);
var theme = require('../../config').theme;
var ReactNative = require('react-native');
var React = require('react');

var {
  Animated,
  StyleSheet,
  View,
  Image,
  TouchableOpacity
} = ReactNative;

class HeaderBarView extends React.Component {
  constructor(props) {
    super(props);

    var loadingScaleX = new Animated.Value(0);
    var loadingScaleOpacity = loadingScaleX.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [0, 0.8, 1, 0.25, 0]
    });

    this.state = {
      loadingScaleX,
      loadingScaleOpacity
    };
  }

  componentDidMount() {

  }

  render() {
    debug('render');

    if (this.props.scanning) this.animateLoading();

    return (
      <View style={[styles.root, this.props.style]}>
        <Animated.View
          style={[styles.loadingBar, {
          bottom: 0,
          opacity: this.state.loadingScaleOpacity,
          transform: [{ scaleX: this.state.loadingScaleX }]
        }]}/>
        <TouchableOpacity style={styles.hamburger}>
          <Image
            style={styles.hamburgerImage}
            source={require('../images/header-bar-hamburger.png')}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logo}>
          <Image
            style={styles.logoImage}
            source={require('../images/header-bar-logo@3x.png')}/>
          </TouchableOpacity>
        <View style={styles.more}>
          <TouchableOpacity>
            <Image
              style={styles.moreImage}
              source={require('../images/header-bar-hamburger.png')}/>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  animateLoading() {
    debug('animate loading');
    if (this.animating) return;

    Animated.timing(this.state.loadingScaleX, {
      toValue: 1,
      duration: 1400
    }).start(() => {
      this.state.loadingScaleX.setValue(0);

      if (this.props.scanning) {
        setTimeout(() => {
          this.animating = false;
          this.animateLoading();
        }, 800);
        return;
      }

      this.animating = false;
    });

    this.animating = true;
  }
}

HeaderBarView.propTypes = {
  style: View.propTypes.style,
  scanning: React.PropTypes.bool
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    flexDirection: 'row'
  },

  hamburger: {
    width: 50,
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  hamburgerImage: {
    width: 26,
    height: 14,
  },

  logo: {
    flex: 1,
    paddingTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoImage: {
    width: 91,
    height: 25,
  },

  more: {
    width: 50,
    paddingTop: 1,
    paddingLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },

  moreImage: {
    width: 3,
    height: 20,
  },

  loadingBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: theme.colorPrimary,
  }
});

/**
 * Exports
 */

module.exports = HeaderBarView;
