'use strict';

/**
 * Dependencies
 */

var measureLayout = require('NativeMethodsMixin').measureLayout;
const Metrics = require('../utils/metrics').Metrics;
var ContextMenuView = require('./context-menu');
var debug = require('../debug')('ListView');
var ReactNative = require('react-native');
var theme = require('../../config').theme;
var ListItem = require('./list-item');
var React = require('react');

var {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Linking,
  RefreshControl,
  Animated,
  LayoutAnimation
} = ReactNative;

/**
 * The number of pixels the first item is
 * offset for the top of the content view.
 *
 * @type {Number}
 */
var FIRST_ITEM_MARGIN_TOP = 4;

class ListView extends React.Component {
  constructor() {
    super(...arguments);

    // initial state
    this.state = {
      items: [],
      contextMenu: null,
      refreshing: false,
      scrollable: true,
      expandedItem: null,
    };

    this.scrollY = 0;

    // bind context for callbacks
    this.onItemLongPress = this.onItemLongPress.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  render() {
    debug('render');
    var expandedItem = this.state.expandedItem;
    var paddingTop = this.props.contentOffsetY + FIRST_ITEM_MARGIN_TOP;
    var Items = this.renderItems();
    var marginTop = 0;

    // offset list content when
    // an item is expanded
    if (expandedItem) {
      marginTop = -(expandedItem.viewportOffsetY - FIRST_ITEM_MARGIN_TOP)
    }

    return (
      <View style={styles.root}>
        <ScrollView
          ref="scrollView"
          style={styles.scrollView}
          refreshControl={this.renderRefreshControl()}
          scrollEnabled={this.state.scrollable}
          onLayout={this.onScrollViewLayout.bind(this)}
          onScroll={this.onScroll.bind(this)}
          scrollEventThrottle={16}>
          <View
            ref="content"
            testId="content"
            style={[styles.content, {
              paddingTop: paddingTop,
              marginTop: marginTop
            }]}
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
    debug('render empty', this.props.scanning);
    if (this.props.scanning) return;
    if (items.length) return;

    return (
      <View style={styles.empty} pointerEvents="none">
        <Text style={styles.emptyText}>Nothing found</Text>
      </View>
    );
  }

  renderItems() {
    debug('render list items');
    var items = this.props.items
    var expandedItem = this.state.expandedItem;

    return items.map(item => {
      var isExpanded = expandedItem && item.id === expandedItem.id;
      var paddingTop = 0;
      var height;

      // expanded items fill the viewport
      if (isExpanded) {
        paddingTop = this.props.contentOffsetY;
        height = this.viewportHeight;
      }

      return <Animated.View
        key={item.id}
        testId="item-wrapper"
        style={{paddingTop, height}}>
        <ListItem
          {...item}
          onLongPress={this.onItemLongPress}
          onGestureStart={this.onItemGestureStart.bind(this)}
          onGestureEnd={this.onItemGestureEnd.bind(this)}
          onSwiped={this.onItemSwiped.bind(this)}
          onPressed={this.onItemPressed.bind(this)}
          expanded={isExpanded}
        />
      </Animated.View>
    });
  }

  renderRefreshControl() {
    var enabled = !this.props.scanning && this.state.scrollable;

    return (
      <RefreshControl
        style={{backgroundColor:'transparent'}}
        tintColor={theme.colorPrimary}
        colors={[theme.colorPrimary]}
        onRefresh={this.onRefresh}
        refreshing={false}
        enabled={enabled}
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
    debug('on item swiped');
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

  onItemPressed(item) {
    this.props.onItemPressed(item);
  }

  onScroll({nativeEvent:{contentOffset}}) {
    this.scrollY = contentOffset.y;
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
      this.refs.scrollView.scrollTo({ y: y });
      setTimeout(resolve, 200);
    });
  }

  expand(item) {
    var current = this.state.expandedItem;
    var id = item.props.id;

    // prevent same item being expanded twice
    if (current && id === current.id) return;

    debug('expanding item', id);
    Metrics.expanded(item.props.unadaptedUrl);

    return this.getItemViewportOffsetY(item)
      .then(viewportOffsetY => {
        debug('expanded item offsetY', viewportOffsetY);

        this.setState({
          scrollable: false,
          expandedItem: {
            viewportOffsetY,
            id
          }
        });

        return this.doLayoutAnimation();
      });
  }

  contract() {
    if (!this.state.expandedItem) return Promise.resolve();

    this.setState({
      scrollable: true,
      expandedItem: null
    });

    return this.doLayoutAnimation();
  }

  doLayoutAnimation() {
    return new Promise(resolve => {
      LayoutAnimation.easeInEaseOut(resolve);
    });
  }

  getItemViewportOffsetY(item) {
    return new Promise(resolve => {
      debug('get item viewport offset');
      var relativeTo = ReactNative.findNodeHandle(this.refs.content);
      measureLayout.call(item, relativeTo, (x, y) => {
        resolve(y - this.scrollY);
      });
    });
  }
}

/**
 * Public properties
 *
 * @type {Object}
 */
ListView.propTypes = {
  items: React.PropTypes.array,
  scanning: React.PropTypes.bool,
  onRefresh: React.PropTypes.func,
  onItemSwiped: React.PropTypes.func,
  onItemPressed: React.PropTypes.func,
  contentOffsetY: React.PropTypes.number
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
    color: '#cacaca',
  },

  content: {
    paddingTop: 10,
    paddingBottom: 20,
  }
});

/**
 * Exports
 */

module.exports = ListView;
