
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
  Linking
} = ReactNative;

class SettingsScene extends React.Component {
  constructor(props) {
    super(props);
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
          <TouchableOpacity
            style={styles.listItem}
            onPress={this.onItemPress.bind(this, "about")}>
            <Text style={styles.listItemText}>About Project Magnet</Text>
          </TouchableOpacity>
          <View style={styles.separator}/>
          <TouchableOpacity
            style={styles.listItem}
            onPress={this.onItemPress.bind(this, "t&c")}>
            <Text style={styles.listItemText}>Terms & Conditions</Text>
          </TouchableOpacity>
          <View style={styles.separator}/>
          <TouchableOpacity
            style={styles.listItem}
            onPress={this.onItemPress.bind(this, "privacy")}>
            <Text style={styles.listItemText}>Privacy Policy</Text>
          </TouchableOpacity>
          <View style={styles.separator}/>
          <TouchableOpacity
            style={styles.listItem}
            onPress={this.onItemPress.bind(this, "feedback")}>
            <Text style={styles.listItemText}>Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
  navigator: React.PropTypes.object,
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
    borderBottomColor: '#eee'
  },

  left: {
    width: 50,
  },

  right: {
    width: 50
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

  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 7,
  },

  listItemText: {
    fontSize: 16,
    color: '#555',
    fontFamily: theme.fontBook,
  },

  separator: {
    height: 1,
    backgroundColor: '#eee'
  }
});
