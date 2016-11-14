'use strict';

/**
 * Dependencies
 */

const debug = require('../../debug')('ItemContainer');
const actions = require('../../store/actions');
const getItem = require('../../api/getItem');
const ReactNative = require('react-native');
const { connect } = require('react-redux');
const React = require('react');
const Item = require('./item');

const {
  View,
  StyleSheet,
} = ReactNative;

class ItemContainer extends React.Component {
  constructor(props) {
    super(props);
    debug('created');
  }

  componentDidMount() {
    if (!this.props.item) return;

    this.fetchData(this.props.itemUrl)
      .then(item => {
        this.props.setOpenItem(item);
      })

      .catch(e => {
        console.log('ERROR', e);
      });
  }

  render() {
    return <Item item={this.props.item}/>;
  }

  renderContent() {

  }
}

ItemContainer.propTypes = {
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
function mapStateToProps(store) {
  return {
    item: store.openItem,
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
  return {
    setOpenItem: actions.setOpenItem,
  };
}

/**
 * Exports
 */

module.exports = connect(mapStateToProps, mapDispatchToProps)(ItemContainer);
