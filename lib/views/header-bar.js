
/**
 * Dependencies
 */

var debug = require('../debug')('HeaderBar');
var ReactNative = require('react-native');
var React = require('react');

var {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  LayoutAnimation
} = ReactNative;

class HeaderBarView extends React.Component {
  render() {
    debug('render');

    return (
      <View style={[styles.root, this.props.style]}>
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
}

HeaderBarView.propTypes = {
  style: View.propTypes.style,
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
  }
});

/**
 * Exports
 */

module.exports = HeaderBarView;
