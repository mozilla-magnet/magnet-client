'use strict';

/**
 * Dependencies
 */

var ContextMenuView = require('./context-menu');
var ReactNative = require('react-native');
var debug = require('../debug')('List');
var ListItem = require('./list-item');
var React = require('react');

var {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Linking,
  RefreshControl,
  PropTypes
} = ReactNative;

class ListView extends React.Component {
  constructor() {
    super(...arguments);

    // initial state
    this.state = {
      contextMenu: null
    };

    // bind context for callbacks
    this.onItemLongPress = this.onItemLongPress.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  render() {
    debug('render');
    var Items = this.renderListItems();

    return (
      <View style={styles.root}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={this.renderRefreshControl()}>
            <View style={styles.content}>{Items}</View>
        </ScrollView>
        {this.renderEmpty(Items)}
        {this.renderContextMenu()}
      </View>
    );
  }

  renderEmpty(items) {
    if (this.props.loading) return;
    if (items.length) return;

    return (
      <View style={styles.empty} pointerEvents="none">
        <Text style={styles.emptyText}>Nothing found</Text>
      </View>
    );
  }

  renderListItems() {
    debug('render list items');
    return this.props.items.map(item => {
      return <ListItem
        {...item}
        onLongPress={this.onItemLongPress}
        key={item.id}
      />
    });
  }

  renderRefreshControl() {
    return (
      <RefreshControl
        onRefresh={this.onRefresh}
        refreshing={this.props.loading}
        title="Scanning..."
      />
    );
  }

  renderContextMenu() {
    if (!this.state.contextMenu) return null;
    return (
      <ContextMenuView
        items={this.state.contextMenu.items}
        onClosed={this.onContextMenuClosed.bind(this)}
      />
    );
  }

  onItemLongPress(item) {
    this.showItemContextMenu(item);
  }

  onRefresh() {
    if (!this.props.onRefresh) return;
    this.props.onRefresh();
  }

  showItemContextMenu(item) {
    this.setState({
      contextMenu: {
        items: [
          {
            text: 'Visit Link',
            callback: () => Linking.openURL(item.props.url)
          },
          {
            text: 'Reload',
            callback: () => {} // needs implementing
          },
          {
            text: 'Hide',
            callback: () => {} // needs implementing
          }
        ]
      }
    });
  }

  onContextMenuClosed() {
    this.setState({ contextMenu: null });
  }
}

ListView.propTypes = {
  items: PropTypes.array,
  loading: PropTypes.bool,
  onRefresh: PropTypes.func
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },

  scrollView: {
    flex: 1
  },

  empty: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },

  emptyText: {
    fontSize: 20,
    fontFamily: 'FiraSans-LightItalic',
    color: '#999'
  },

  content: {
    padding: 14
  }
});

/**
 * Exports
 */

module.exports = ListView;
