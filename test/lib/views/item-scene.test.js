import ItemScene from '../../../lib/views/item/scene';
import { createStore, applyMiddleware } from 'redux';
import reducer from '../../../lib/store/reducer';
import renderer from 'react-test-renderer';
import thunk from 'redux-thunk';
import React from 'react';
import 'react-native';

it('renders without crashing', () => {
  const store = createStore(reducer, applyMiddleware(thunk));
  renderer.create(<ItemScene navigator={{}} item={{}} store={store}/>);
});
