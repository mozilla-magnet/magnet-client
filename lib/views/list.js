'use strict';

/**
 * Dependencies
 */

var ContextMenuView = require('./context-menu');
var debug = require('../debug')('ListView');
var ReactNative = require('react-native');
var ListItem = require('./list-item');
var React = require('react');

var {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Linking,
  RefreshControl
} = ReactNative;

class ListView extends React.Component {
  constructor() {
    super(...arguments);

    // initial state
    this.state = {
      items: [],
      contextMenu: null,
      refreshing: false,
      scrollable: true
    };

    this.scrollY = 0;

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
          ref={ref => this.scrollView = ref}
          style={styles.scrollView}
          refreshControl={this.renderRefreshControl()}
          scrollEnabled={this.state.scrollable}
          onLayout={this.onScrollViewLayout.bind(this)}
          onScroll={this.onScroll.bind(this)}>
          <View
            testId={"content"}
            style={styles.content}
            onLayout={this.onScrollContentViewLayout.bind(this)}>
            {Items}
          </View>
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
        onGestureStart={this.onItemGestureStart.bind(this)}
        onGestureEnd={this.onItemGestureEnd.bind(this)}
        onSwiped={this.onItemSwiped.bind(this)}
        key={item.id}
      />
    });
  }

  renderRefreshControl() {
    return (
      <RefreshControl
        onRefresh={this.onRefresh}
        refreshing={this.props.loading}
        enabled={this.state.scrollable}
        title="Scanning..."
      />
    );
  }

  renderContextMenu() {
    if (!this.state.contextMenu) return;
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

  onItemGestureStart() {
    this.setState({ scrollable: false });
  }

  onItemGestureEnd() {
    this.setState({ scrollable: true });
  }

  onItemSwiped(item) {
    debug('on item swiped', item);
    var newMaxScrollY = this.getMaxScrollY() - item.height;
    this.prepareForNewMaxScrollY(newMaxScrollY)
    this.props.onItemSwiped(item);
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

  onScroll({nativeEvent}) {
    this.scrollY = nativeEvent.contentOffset.y;
  }

  onScrollViewLayout({nativeEvent:{layout}}) {
    this.viewportHeight  = layout.height;
  }

  onScrollContentViewLayout({nativeEvent:{layout}}) {
    this.scrollHeight = layout.height;
  }

  getMaxScrollY() {
    return this.scrollHeight - this.viewportHeight;
  }

  prepareForNewMaxScrollY(newMaxScrollY) {
    debug('prepare for new max-scroll-y', newMaxScrollY, this.newMaxScrollY);
    if (newMaxScrollY >= this.scrollY) return Promise.resolve();
    return this.scrollTo(newMaxScrollY);
  }

  scrollTo(y) {
    return new Promise(resolve => {
      debug('scroll to', y);
      this.scrollView.scrollTo({ y: y });
      setTimeout(resolve, 200);
    });
  }
}

ListView.propTypes = {
  items: React.PropTypes.array,
  loading: React.PropTypes.bool,
  onRefresh: React.PropTypes.func,
  onItemSwiped: React.PropTypes.func
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
