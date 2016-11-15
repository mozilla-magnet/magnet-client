'use strict';

/**
 * Dependencies
 */

import { theme } from '../../../config';
import ListItem from './list-item';
import Debug from '../../debug';
import React from 'react';

import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  RefreshControl,
  LayoutAnimation,
} from 'react-native';

const debug = Debug('ListView');

class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { scrollable: true };
    this.scrollY = 0;

    // bind context
    this.onRefresh = this.onRefresh.bind(this);
    this.sort = this.sort.bind(this);

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
          removeClippedSubviews={false}
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
      : 'nothing found';

    return (
      <View style={styles.empty} pointerEvents="none">
        <Text key={this.props.scanning} style={styles.emptyText}>{text}</Text>
      </View>
    );
  }

  renderItems() {
    debug('render list items');
    var { items}  = this.props;

    // only sort if preffed on
    if (this.props.sortByDistance) {
      items = items.sort(this.sort);
    }

    return items.map(item => {
      debug('render id', item.id);
      return <ListItem
        key={item.id}
        item={item}
        showDistance={this.props.showDistance}
        onPress={this.props.onItemPress}
      />;
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

  sort(item1, item2) {
    item1 = item1.value;
    item2 = item2.value;

    var distance1 = item1.distance;
    var distance2 = item2.distance;

    if (distance1 === distance2) return 0;

    // mdns
    if (distance1 === null) return 1;

    return distance1 > distance2 ? 1 : -1;
  }

  onItemGestureStart() {
    this.setState({ scrollable: false });
  }

  onItemGestureEnd() {
    this.setState({ scrollable: true });
  }

  onItemsChange() {
    this.doLayoutAnimation();
  }

  onRefresh() {
    if (!this.props.onRefresh) return;
    this.props.onRefresh();
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
        delete: { type: 'easeInEaseOut', property: 'opacity' },
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
  sortByDistance: React.PropTypes.bool,
  showDistance: React.PropTypes.bool,
  onRefresh: React.PropTypes.func,
  onItemPress: React.PropTypes.func,
  contentOffsetY: React.PropTypes.number,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  empty: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 20,
    fontFamily: theme.fontLightItalic,
    color: '#aaa',
  },

  content: {
    paddingTop: 4,
  },
});

/**
 * Exports
 */

module.exports = ListView;
