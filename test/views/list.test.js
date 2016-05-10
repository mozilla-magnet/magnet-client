'use strict';

/**
 * Dependencies
 */

const ListView = require('../../lib/views/list');
const ReactNative = require('react-native');
const assert = require('assert');
const enzyme = require('enzyme');
const sinon = require('sinon');
const React = require('react');
const Text = ReactNative.Text;

describe('<ListView>', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.clock = this.sinon.useFakeTimers();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('populated', function() {
    it('renders a list item view for each', function() {
      var items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      this.wrapper = enzyme.shallow(<ListView items={items} loading={false}/>);
      expect(this.wrapper.find('ListItem')).to.have.length(3);
    });
  });

  describe('empty and not-loading', function() {
    it('renders text warning', function() {
      this.wrapper = enzyme.shallow(<ListView items={[]} loading={false}/>);
      expect(this.wrapper).to.contain('Nothing found');
    });
  });

  describe('empty and loading', function() {
    it('renders text warning', function() {
      this.wrapper = enzyme.shallow(<ListView items={[]} loading={true}/>);
      assert(!this.wrapper.contains(<Text>Nothing found</Text>));
    });
  });
});
