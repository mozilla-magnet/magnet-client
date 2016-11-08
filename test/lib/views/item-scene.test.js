import 'react-native';
import React from 'react';
import ItemScene from '../../../lib/views/item-scene';

import renderer from 'react-test-renderer';

it('renders without crashing', () => {
  renderer.create(<ItemScene navigator={{}} item={{}}/>);
});
