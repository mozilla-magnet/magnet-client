'use strict';

/**
 * Dependencies
 */

const { theme } = require('../../../config');
const ReactNative = require('react-native');
const React = require('react');

const {
  TouchableOpacity,
  StyleSheet,
  Image,
} = ReactNative;

class SubscribeButton extends React.Component {
  render() {
    const state = this.getMode();
    return <TouchableOpacity
      style={[styles.root, styles[state]]}
      onPress={this.onPress.bind(this)}
      >{this.renderIcon()}
    </TouchableOpacity>;
  }

  getMode() {
    return this.props.subscribed
      ? 'subscribed'
      : 'unsubscribed';
  }

  renderIcon() {
    if (this.props.subscribed) {
      return <Image
        style={styles.iconSubscribed}
        source={require('./tick-icon.png')}/>
    } else {
      return <Image
        style={styles.iconUnsubscribed}
        source={require('./plus-icon.png')}/>
    }
  }

  onPress() {
    this.props.onChange(!this.props.subscribed);
  }
}

var styles = StyleSheet.create({
  root: {
    width: 33,
    height: 31,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  unsubscribed: {
    borderWidth: 1,
    borderColor: '#bbb',
  },

  subscribed: {
    backgroundColor: '#05B201'
  },

  iconSubscribed: {
    width: 17.6,
    height: 13.4,
  },

  iconUnsubscribed: {
    width: 19,
    height: 17,
  },
});

/**
 * Defines the properties passed to
 * this component that are used.
 *
 * @type {Object}
 */
SubscribeButton.propTypes = {
  subscribed: React.PropTypes.bool,
  onChange: React.PropTypes.func,
};

/**
 * Exports
 */

module.exports = SubscribeButton;
