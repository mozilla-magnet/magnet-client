
/**
 * Dependencies
 */

var debug = require('../debug')('HeaderBar');
var theme = require('../../config').theme;
var ReactNative = require('react-native');
var React = require('react');

var {
  Animated,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  LayoutAnimation
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
        {this.renderLeft()}
        <TouchableOpacity style={styles.logo}>
          <Image
            style={styles.logoImage}
            source={require('../images/header-bar-logo.png')}/>
        </TouchableOpacity>
        {this.renderRight()}
      </View>
    )
  }

  componentWillUpdate() {
    LayoutAnimation.easeInEaseOut();
  }

  renderLeft() {
    return <View style={styles.left}>
      {this.renderCloseButton()}
    </View>
  }

  renderCloseButton() {
    var visible = !!this.props.expandedMode;
    if (!visible) return;

    debug('render close button');

    return <TouchableOpacity
      testId="close-button"
      style={styles.close}
      onPress={this.props.onClosePressed.bind(this)}>
      <Image
        style={styles.closeImage}
        source={require('../images/header-bar-close.png')}/>
    </TouchableOpacity>
  }

  renderHamburgerButton() {
    var visible = !this.props.expandedMode;
    if (!visible) return;

    debug('render hamburger button');

    return <TouchableOpacity
      testId="hamburger-button"
      style={styles.hamburger}
      onPress={this.props.onHamburgerPressed.bind(this)}>
      <Image
        style={styles.hamburgerImage}
        source={require('../images/header-bar-hamburger.png')}/>
    </TouchableOpacity>
  }

  renderRight() {
    return <View style={styles.right}>
    </View>
  }

  renderMoreButton() {
    var visible = !!this.props.expandedMode;
    if (!visible) return;

    debug('render more');

    return <TouchableOpacity
      testId="more-button"
      style={styles.more}
      onPress={this.props.onMorePressed.bind(this)}>
      <Image
        style={styles.moreImage}
        source={require('../images/header-bar-more.png')}/>
    </TouchableOpacity>
  }

  animateLoading() {
    if (this.animating) return;
    debug('animating loading');

    Animated.timing(this.state.loadingScaleX, {
      toValue: 1,
      duration: 1400
    }).start(() => {
      debug('animated loading');
      this.state.loadingScaleX.setValue(0);

      if (!this.props.scanning) {
        this.animating = false;
        return;
      }

      // pause between animations
      setTimeout(() => {
        this.animating = false;
        this.animateLoading();
      }, 800);
    });

    this.animating = true;
  }
}

HeaderBarView.propTypes = {
  style: View.propTypes.style,
  scanning: React.PropTypes.bool,
  expandedMode: React.PropTypes.bool,
  onClosePressed: React.PropTypes.func,
  onHamburgerPressed: React.PropTypes.func,
  onMorePressed: React.PropTypes.func,
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    flexDirection: 'row'
  },

  left: {
    width: 60,
    justifyContent: 'center',
  },

  right: {
    width: 60,
    justifyContent: 'center',
  },

  hamburger: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  hamburgerImage: {
    width: 26,
    height: 14,
  },

  close: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeImage: {
    width: 20,
    height: 20,
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
    flex: 1,
    paddingTop: 1,
    paddingLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
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
