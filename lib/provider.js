'use strict';

/**
 * Dependencies
 */

const { Provider } = require('react-redux');
const store = require('./store');
const React = require('react');
const App = require('./app');

/**
 * The (data) Provider 'container' view.
 *
 * This view has no visual-state. It's one
 * job is to 'provide' the redux store
 * to the child `<App/>`.
 *
 * You can find out more about the Provider
 * by reading the react-redux docs.
 *
 * @type {ReactComponent}
 */
class AppProvider extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <App/>
      </Provider>
    );
  }
}

/**
 * Exports
 */

module.exports = AppProvider;
