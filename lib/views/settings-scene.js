
/**
 * Dependencies
 */

const debug = require('../debug')('SettingsScene');
const { theme, settings } = require('../../config');
const ReactNative = require('react-native');
const track = require('../utils/tracker');
const React = require('react');

const {
  TouchableOpacity,
  StyleSheet,
  Image,
  View,
  Text,
  Linking,
  Switch,
} = ReactNative;

/**
 * The `SettingsScene` is a UI for users
 * to toggle the default `config.userFlags`,
 * as well as linking to outsid: privacy,
 * feedback and contact pages on trymagnet.org.
 *
 * To add a new `userFlag` just add it to config.js
 * and then use `this.props.userFlags.<MY_FLAG>`
 * in the relevant part(s) of the codebase to
 * enable the feature.
 *
 * @type {ReactComponent}
 */
class SettingsScene extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.userFlags !== this.props.userFlags;
  }

  render() {
    debug('render');

    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.left}>
            <TouchableOpacity
              testId="close-button"
              style={styles.close}
              onPress={this.onClosePress.bind(this)}>
              <Image
                style={styles.closeImage}
                source={require('../images/header-close-icon.png')}/>
            </TouchableOpacity>
          </View>
          <View style={styles.middle}>
            <Text style={styles.title}>settings</Text>
          </View>
          <View style={styles.right}/>
        </View>
        <View style={styles.list}>
          {this.renderUserFlags(this.props.userFlags)}
          <TouchableOpacity
            style={styles.listItem}
            onPress={this.onItemPress.bind(this, 'about')}>
            <Text style={styles.listItemTitle}>About Project Magnet</Text>
          </TouchableOpacity>
          <View style={styles.separator}/>
          <TouchableOpacity
            style={styles.listItem}
            onPress={this.onItemPress.bind(this, 'privacy')}>
            <Text style={styles.listItemTitle}>Privacy Policy</Text>
          </TouchableOpacity>
          <View style={styles.separator}/>
          <TouchableOpacity
            style={styles.listItem}
            onPress={this.onItemPress.bind(this, 'feedback')}>
            <Text style={styles.listItemTitle}>Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderUserFlags(flags) {
    return Object.keys(flags).map(key => {
      var { value, title, description } = flags[key];
      debug('render user flag', key, value);
      const TextDescription = description
        && <Text style={styles.listItemDescription}>{description}</Text>;

      return <View key={key}>
        <View
          style={styles.listItem}>
          <TouchableOpacity
            style={styles.listItemText}
            onPress={this.toggler(key)}>
            <Text style={styles.listItemTitle}>{title}</Text>
            {TextDescription}
          </TouchableOpacity>
          <Switch
            value={value}
            onValueChange={this.toggler(key)}
            />
          </View>
          <View style={styles.separator}/>
        </View>;
    });
  }

  toggler(key) {
    return value => {
      value = typeof value === 'boolean' ? value : !this.props.userFlags[key];
      debug('toggle', key, value);
      track.changeSetting(key, value);
      this.props.onSettingChange(key, value);
    };
  }

  onRefresh() {}
  onItemSwiped() {}
  onClosePress() {
    this.props.navigator.pop();
  }

  onItemPress(id) {
    const url = settings.links[id];
    if (!url) { return; }
    track.event('interaction', `tap-${id}`);
    Linking.openURL(url).catch(err => {
      console.info(`Could not open url ${url} `, err);
    });
  }
}

SettingsScene.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  userFlags: React.PropTypes.object.isRequired,
  onSettingChange: React.PropTypes.func.isRequired,
};

/**
 * Exports
 */

module.exports = SettingsScene;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  left: {
    width: 50,
  },

  right: {
    width: 50,
  },

  middle: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    color: '#aaa',
    fontFamily: theme.fontLightItalic,
  },

  list: {
    paddingHorizontal: 7,
  },

  close: {
    padding: 14,
  },

  closeImage: {
    width: 18,
    height: 18,
    marginTop: 2,
  },

  listItemText: {
    flex: 1,
    justifyContent:'center',
    paddingRight: 12,
  },

  listItem: {
    // height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 7,
  },

  listItemTitle: {
    fontSize: 16,
    color: '#555',
    fontFamily: theme.fontBook,
  },

  listItemDescription: {
    fontSize: 11,
    marginTop: 2,
    color: '#999',
    fontFamily: theme.fontBook,
  },

  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});
