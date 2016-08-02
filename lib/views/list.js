'use strict';

/**
 * Dependencies
 */

const debug = require('../debug')('ListView');
const ListItem = require('./list-item');
const React = require('react');

const {
  StyleSheet,
  ScrollView,
  View,
  Text,
  RefreshControl,
  LayoutAnimation,
} = require('react-native');

const {
  theme,
  flags
} = require('../../config');

class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { scrollable: true };
    this.scrollY = 0;
    this.onRefresh = this.onRefresh.bind(this);
    this.layoutAnimation = LayoutAnimation.create(
      300,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.items !== this.props.items) this.onItemsChange();
  }

  render() {
    debug('render');
    var Items = this.renderItems();

    return (
      <View style={styles.root}>
        <ScrollView
          ref="scrollView"
          style={styles.scrollView}
          refreshControl={this.renderRefreshControl()}
          scrollEnabled={this.state.scrollable}
          scrollEventThrottle={16}
          onScroll={this.onScroll.bind(this)}
          onLayout={this.onScrollViewLayout.bind(this)}>
          <View
            ref="content"
            testId="content"
            style={styles.content}
            onLayout={this.onScrollContentViewLayout.bind(this)}>
            {Items}
          </View>
        </ScrollView>
        {this.renderMessage()}
      </View>
    );
  }

  renderMessage() {
    if (this.props.items.length) return;
    if (this.props.scanning === undefined) return;
    debug('rendering message');

    var text = this.props.scanning
      ? 'scanning \u2026'
      : 'nothing found'

    return (
      <View style={styles.empty} pointerEvents="none">
        <Text key={this.props.scanning} style={styles.emptyText}>{text}</Text>
      </View>
    );
  }

  renderItems() {
    debug('render list items');
    var items = this.props.items
    return items
      .filter(item => !item.hidden)
      .map((item) => {
      return <ListItem
        key={item.originalUrl}
        item={item}
        swipable={flags.itemsSwipable}
        onLongPress={this.onItemLongPress}
        onGestureStart={this.onItemGestureStart.bind(this)}
        onGestureEnd={this.onItemGestureEnd.bind(this)}
        onSwiped={this.onItemSwiped.bind(this)}
        onPress={this.onItemPress.bind(this)}
      />
    });
  }

  renderRefreshControl() {
    return (
      <RefreshControl
        style={{backgroundColor:'transparent'}}
        tintColor={theme.colorPrimary}
        colors={[theme.colorPrimary]}
        onRefresh={this.onRefresh}
        refreshing={false}
        enabled={true}
      />
    );
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
    this.props.onItemSwiped(item.props.item);
  }

  onItemsChange() {
    this.doLayoutAnimation();
  }

  onRefresh() {
    if (!this.props.onRefresh) return;
    this.props.onRefresh();
  }

  onItemPress({props}) {
    debug('on item press');
    this.props.onItemPress(props.item);
  }

  onScroll({nativeEvent:{contentOffset}}) {
    this.scrollY = contentOffset.y;
  }

  onScrollViewLayout({nativeEvent:{layout}}) {
    this.viewportHeight = layout.height;
  }

  onScrollContentViewLayout({nativeEvent:{layout}}) {
    this.scrollHeight = layout.height;
  }

  getMaxScrollY() {
    return this.scrollHeight - this.viewportHeight;
  }

  prepareForNewMaxScrollY(newMaxScrollY) {
    debug('prepare for new max-scroll-y', newMaxScrollY, this.scrollY);
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

  doLayoutAnimation() {
    return new Promise(resolve => {
      LayoutAnimation.configureNext({
        duration: 300,
        update: { type: 'easeInEaseOut' },
        delete: { type: 'easeInEaseOut', property: 'opacity' }
      }, resolve);
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
  onItemPress: React.PropTypes.func,
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
    fontFamily: theme.fontLightItalic,
    color: '#aaa',
  },

  content: {
    paddingTop: 4
  }
});

/**
 * Exports
 */

module.exports = ListView;
