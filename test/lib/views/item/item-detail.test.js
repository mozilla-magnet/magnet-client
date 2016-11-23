import ItemDetail from '../../../../lib/views/item/item-detail';
import renderer from 'react-test-renderer';
import { createStore, applyMiddleware } from 'redux';
import reducer from '../../../../lib/store/reducer';
import thunk from 'redux-thunk';
import React from 'react';
import 'react-native';

it('renders without crashing', () => {
  const store = createStore(reducer, applyMiddleware(thunk));
  renderer.create(<ItemDetail navigator={{}} item={{}} store={store}/>);
});
