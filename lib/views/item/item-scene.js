'use strict';

/**
 * Dependencies
 */

import { fetchItemIfNeeded } from '../../store/actions';
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import ItemDetail from './item-detail';

class ItemScene extends Component {
  componentDidMount() {
    const { itemId, dispatch } = this.props;
    dispatch(fetchItemIfNeeded(itemId));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.itemId !== this.props.itemId) {
      const { dispatch, itemId } = nextProps;
      dispatch(fetchItemIfNeeded(itemId));
    }
  }

  render() {
    const { itemId, items, navigator } = this.props;
    const item = items[itemId];

    return <ItemDetail
        item={item}
        navigator={navigator}
      />;
  }
}

ItemScene.propTypes = {
  navigator: PropTypes.object.isRequired,
  itemId: PropTypes.string,
  items: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
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
function mapStateToProps({ items }) {
  return {
    items,
  };
}

/**
 * Exports
 */

module.exports = connect(mapStateToProps)(ItemScene);
