'use strict';

/**
 * Dependencies
 */

const resolveItem = require('../../store/resolve-item');
const debug = require('../../debug')('ItemScene');
const { connect } = require('react-redux');
const React = require('react');
const Item = require('./item');

class ItemScene extends React.Component {
  render() {
    const { item, navigator } = this.props;

    return <Item
        item={item}
        navigator={navigator}
      />;
  }
}

ItemScene.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  itemUrl: React.PropTypes.string,
  item: React.PropTypes.object,
  setOpenItem: React.PropTypes.func,
};

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
 * Exports
 */

module.exports = connect(mapStateToProps)(ItemScene);
