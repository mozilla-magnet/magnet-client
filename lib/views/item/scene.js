'use strict';

/**
 * Dependencies
 */

const resolveItem = require('../../store/resolve-item');
const debug = require('../../debug')('ItemScene');
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const React = require('react');
const Item = require('./item');

const {
  StyleSheet,
} = ReactNative;

class ItemScene extends React.Component {
  constructor(props) {
    super(props);
    debug('created');
  }

  componentDidMount() {

  }

  render() {
    const { item, navigator } = this.props;
    if (!item) return null;

    return <Item
        item={item}
        navigator={navigator}
      />;
  }

  renderContent() {

  }
}

ItemScene.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  itemUrl: React.PropTypes.string,
  item: React.PropTypes.object,
  setOpenItem: React.PropTypes.func,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  content: {
    flex: 1,
  },
});

/**
 * Takes the redux `store` (passed down by
 * the parent `Provider`) view and maps
 * specific properties onto the App's
 * `this.props` object.
 *
 * This means the app never touches the
 * redux store directly and prevents
 * hacky code being written.
 *
 * @param  {ReduxStore} store
 * @return {Object}
 */
function mapStateToProps({ openItem }) {
  return {
    item: resolveItem(openItem),
  };
}

/**
 * Maps the methods exported from `action-creators.js`
 * to `this.props.<ACTION_NAME>`.
 *
 * @param  {function} dispatch
 * @return {Object}
 */
function mapDispatchToProps() {
  return {};
}

/**
 * Exports
 */

module.exports = connect(mapStateToProps, mapDispatchToProps)(ItemScene);
