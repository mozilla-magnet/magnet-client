
/**
 * Dependencies
 */

var debug = require('../debug')('HeaderBar');
var ReactNative = require('react-native');
var React = require('react');

var {
  TouchableOpacity,
  StyleSheet,
  Image,
  View,
} = ReactNative;

class HeaderBarView extends React.Component {
  render() {
    debug('render');

    return (
      <View style={[styles.root]}>
        {this.renderLeft()}
        <TouchableOpacity style={styles.logo}>
          <Image
            style={styles.logoImage}
            source={require('../images/header-logo.png')}/>
        </TouchableOpacity>
        {this.renderRight()}
      </View>
    )
  }

  componentWillUpdate() {
    // LayoutAnimation.easeInEaseOut();
  }

  renderLeft() {
    return <View style={styles.left}>
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
      onPress={this.props.onMenuPress}>
      <Image
        style={styles.hamburgerImage}
        source={require('../images/header-bar-hamburger.png')}/>
    </TouchableOpacity>
  }

  renderRight() {
    return <View style={styles.right}>
      <TouchableOpacity
        style={styles.settings}
        onPress={this.props.onMenuPress}>
        <Image
          style={styles.settingImage}
          source={require('../images/header-settings-icon.png')}/>
      </TouchableOpacity>
    </View>
  }
}

HeaderBarView.propTypes = {
  style: View.propTypes.style,
  expandedMode: React.PropTypes.bool,
  onClosePressed: React.PropTypes.func,
  onMenuPress: React.PropTypes.func,
  onMorePressed: React.PropTypes.func,
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    flexDirection: 'row',
    height: 56,
    borderBottomWidth: 0.7,
    borderBottomColor: '#ddd'
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 3,
  },

  logoImage: {
    width: 78.62,
    height: 22.8,
    // opacity: 0.5,
  },

  settings: {
    flex: 1,
    paddingTop: 1,
    paddingLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingImage: {
    width: 22,
    height: 22,
  }
});

/**
 * Exports
 */

module.exports = HeaderBarView;
