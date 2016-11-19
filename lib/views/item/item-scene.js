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
    const { openItem, dispatch } = this.props;
    dispatch(fetchItemIfNeeded(openItem));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.openItem !== this.props.openItem) {
      const { dispatch, openItem } = nextProps;
      dispatch(fetchItemIfNeeded(openItem));
    }
  }

  render() {
    const { openItem, items, navigator } = this.props;
    const item = items[openItem];

    return <ItemDetail
        item={item}
        navigator={navigator}
      />;
  }
}

ItemScene.propTypes = {
  navigator: PropTypes.object.isRequired,
  itemUrl: PropTypes.string,
  openItem: PropTypes.string,
  items: PropTypes.object,
  setOpenItem: PropTypes.func,
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
function mapStateToProps({ openItem, items }) {
  return {
    items,
    openItem,
  };
}

/**
 * Exports
 */

module.exports = connect(mapStateToProps)(ItemScene);
