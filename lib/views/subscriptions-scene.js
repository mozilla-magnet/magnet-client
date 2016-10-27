'use strict';

/**
 * Dependencies
 */

const debug = require('../debug')('ListScene');
const ReactNative = require('react-native');
const HeaderBar = require('./header-bar');
const { theme } = require('../../config');
const React = require('react');

const {
  TouchableOpacity,
  StyleSheet,
  Image,
  View,
  Text,
} = ReactNative;

class SubscriptionsScene extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    debug('render');

    return (
      <View style={styles.root}>
        {this.renderHeader()}
      </View>
    );
  }

  renderHeader() {
    return <HeaderBar
      left={[<TouchableOpacity
          style={styles.close}
          onPress={this.onClosePress.bind(this)}>
          <Image
            style={styles.closeImage}
            source={require('../images/header-close-icon.png')}/>
        </TouchableOpacity>
      ]}

      center={<Text style={styles.title}>subscriptions</Text>}
    />
  }

  onClosePress() {
    debug('on close press');
    this.props.navigator.pop();
  }
}

SubscriptionsScene.propTypes = {
  items: React.PropTypes.array,
  navigator: React.PropTypes.object,
};

/**
 * Exports
 */

module.exports = SubscriptionsScene;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff'
  },

  close: {
    padding: 14,
  },

  closeImage: {
    width: 18,
    height: 18,
    marginTop: 2,
  },

  title: {
    fontSize: 22,
    color: '#aaa',
    fontFamily: theme.fontLightItalic,
  },
});
