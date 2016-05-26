'use strict';

/**
 * Dependencies
 */

const ContentViewEmbed = require('../../../../lib/views/list-item/content/embed');
const assert = require('assert');
const enzyme = require('enzyme');
const sinon = require('sinon');
const React = require('react');

describe('<ContentViewEmbed>', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.clock = this.sinon.useFakeTimers();
    this.itemData = {
      embed: { width: 300, height: 300 }
    };

    this.wrapper = enzyme.shallow(<ContentViewEmbed {...this.itemData}/>);
    this.instance = this.wrapper.instance();
  });

  describe('expanded', function() {
    beforeEach(function() {
      this.wrapper.setProps({
        expanded: true
      });
    });

    it('enables pointer-events', function() {
      assert.equal(this.wrapper.props().pointerEvents, 'auto');
    });
  });

  describe('contracted', function() {
    beforeEach(function() {
      this.wrapper.setProps({
        expanded: false
      });
    });

    it('disabled pointer-events', function() {
      assert.equal(this.wrapper.props().pointerEvents, 'none');
    });
  });
});
