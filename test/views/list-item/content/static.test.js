'use strict';

/**
 * Dependencies
 */

const ContentViewStatic = require('../../../../lib/views/list-item/content/static');
const ReactNative = require('react-native');
const assert = require('assert');
const enzyme = require('enzyme');
const sinon = require('sinon');
const React = require('react');

describe('<ContentViewStatic>', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.clock = this.sinon.useFakeTimers();
    this.itemData = {
      title: 'title',
      description: 'description',
      url: 'http://goo.gl/abc123',
      unadaptedUrl: 'http://mozilla.org',
      icon: 'icon.png'
    };

    this.wrapper = enzyme.shallow(<ContentViewStatic {...this.itemData}/>);
    this.instance = this.wrapper.instance();
    this.titleText = this.wrapper.findWhere(el => el.props().testId === 'title-text');
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('one line title', function() {
    beforeEach(function() {
      this.icon = this.wrapper.findWhere(el => el.props().testId === 'icon');

      // fake layout event
      this.titleText.props().onLayout({
        nativeEvent: {
          layout: {
            width: 300,
            height: 32
          }
        }
      });
    });

    // this test isn't great, but updating the state
    // doesn't seems to propagate to child components,
    // so we can't test that the icon's margin changed :(
    it('does not offset the icon', function() {
      assert.equal(this.instance.state.titleLineCount, 1);
    });
  });

  describe('two line title', function() {
    beforeEach(function() {
      this.icon = this.wrapper.findWhere(el => el.props().testId === 'icon');

      // fake layout event
      this.titleText.props().onLayout({
        nativeEvent: {
          layout: {
            width: 300,
            height: 64
          }
        }
      });
    });

    // same issues as above test
    it('does not offset the icon', function() {
      assert.equal(this.instance.state.titleLineCount, 2);
    });
  });
});
