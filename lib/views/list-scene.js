
/**
 * Dependencies
 */

const debug = require('../debug')('ListScene');
const ReactNative = require('react-native');
const HeaderBar = require('./header-bar');
const ListView = require('./list');
const React = require('react');

const {
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  View,
} = ReactNative;

class ListScene extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    debug('render', this.props.scanning);
    var { sortByDistance, showDistance } = this.props.userFlags;

    return (
      <View style={styles.root}>
        {this.renderHeader()}
        <ListView
          ref="list"
          style={{flex:1}}
          items={this.props.items}
          sortByDistance={sortByDistance.value}
          showDistance={showDistance.value}
          scanning={this.props.scanning}
          onRefresh={this.props.onRefresh}
          onItemPress={this.props.onItemPress}
          onItemSwiped={this.props.onItemSwiped}/>
      </View>
    );
  }

  renderHeader() {
    return <HeaderBar
      center={<TouchableOpacity style={styles.logo}>
          <Image
            style={styles.logoImage}
            source={require('../images/header-logo.png')}/>
        </TouchableOpacity>}

      right={[
        this.renderSubscriptionsButton(),
        <TouchableOpacity
          key="icon2"
          style={[styles.settings, { paddingRight: 6 }]}
          onPress={this.onSettingsPress.bind(this)}>
          <Image
            style={styles.settingImage}
            source={require('../images/header-settings-icon.png')}/>
        </TouchableOpacity>
      ]}
    />
  }

  renderSubscriptionsButton() {
    if (Platform.OS === 'ios') return;
    return <TouchableOpacity
      key="icon1"
      style={styles.settings}
      onPress={this.onSubscriptionsPress.bind(this)}>
      <Image
        style={styles.subscriptionsImage}
        source={require('../images/header-subscriptions-icon.png')}/>
    </TouchableOpacity>
  }

  onRefresh() {}

  onSubscriptionsPress() {
    debug('on subscriptions press');
    this.props.navigator.push({ type: 'subscriptions' });
  }

  onSettingsPress() {
    debug('on settings press');
    this.props.navigator.push({ type: 'settings' });
  }
}

ListScene.propTypes = {
  items: React.PropTypes.array,
  scanning: React.PropTypes.bool,
  navigator: React.PropTypes.object,
  userFlags: React.PropTypes.object,
  onItemPress: React.PropTypes.func.isRequired,
  onItemSwiped: React.PropTypes.func.isRequired,
  onRefresh: React.PropTypes.func.isRequired,
};

/**
 * Exports
 */

module.exports = ListScene;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff'
  },

  logo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 1,
  },

  logoImage: {
    width: 141.76,
    height: 22.8,
  },

  settings: {
    width: 37,
    paddingTop: 1,
    paddingLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingImage: {
    width: 22,
    height: 22,
  },

  subscriptionsImage: {
    width: 22,
    height: 23,
  }
});
