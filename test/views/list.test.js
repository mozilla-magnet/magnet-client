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
      this.wrapper = enzyme.shallow(<ListView items={items} scanning={false}/>);
      expect(this.wrapper.find('ListItem')).to.have.length(3);
    });
  });

  describe('empty and not-scanning', function() {
    it('renders text warning', function() {
      this.wrapper = enzyme.shallow(<ListView items={[]} scanning={false}/>);
      expect(this.wrapper).to.contain('Nothing found');
    });
  });

  describe('empty and scanning', function() {
    it('renders text warning', function() {
      this.wrapper = enzyme.shallow(<ListView items={[]} scanning={true}/>);
      expect(this.wrapper).to.not.contain('Nothing found');
    });
  });

  describe('layout', function() {
    beforeEach(function() {
      this.onItemSwipedCallback = sinon.spy();

      // render test subject
      var wrapper = enzyme.shallow(<ListView
        items={[]}
        onItemSwiped={this.onItemSwipedCallback}
      />);

      this.scrollView = wrapper.find('ScrollView');
      this.contentView = wrapper.findWhere(el => el.props().testId === 'content');
      this.instance = wrapper.instance();

      fakeLayoutEvent(this.scrollView, {
        width: 300,
        height: 500
      });

      fakeLayoutEvent(this.contentView, {
        width: 300,
        height: 1200
      });
    });

    it('can return the maxScrollY()', function() {
      assert.equal(this.instance.getMaxScrollY(), 700);
    });

    describe('scroll to bottom', function() {
      beforeEach(function() {
        var maxScrollY = this.instance.getMaxScrollY();
        var onScroll = this.scrollView.props().onScroll;
        var y = 0

        // fake scroll
        while (++y <= maxScrollY) {
          onScroll({
            nativeEvent: {
              contentOffset: { x: 0, y: y }
            }
          });
        }
      });

      it('stores scrollY value', function() {
        assert(this.instance.scrollY);
        assert.equal(this.instance.scrollY, this.instance.getMaxScrollY());
      });

      it('can return the maxScrollY()', function() {
        assert.equal(this.instance.getMaxScrollY(), 700);
      });

      describe('item swiped', function() {
        beforeEach(function() {
          this.onItemSwiped = this.instance.onItemSwiped;
          this.fakeItem = { height: 100 };
          sinon.stub(this.instance, 'scrollTo');

        });

        describe('needs scroll adjustment', function() {
          beforeEach(function() {
            this.onItemSwiped.call(this.instance, this.fakeItem);
          });

          it('adjusts the scroll to accommodate for missing item', function() {
            sinon.assert.calledOnce(this.instance.scrollTo);
            sinon.assert.calledWith(this.instance.scrollTo, 600);
          });

          it('calls props.onItemSwiped() callback', function() {
            sinon.assert.calledOnce(this.onItemSwipedCallback);
          });
        })

        describe('does not need scroll adjustment', function() {
          beforeEach(function() {
            this.instance.scrollY = 0;
            this.onItemSwiped.call(this.instance, this.fakeItem);
          });

          it('does not adjust scroll when viewport is not within subtracted scroll area', function() {
            sinon.assert.notCalled(this.instance.scrollTo);
          });

          it('calls props.onItemSwiped() callback', function() {
            sinon.assert.calledOnce(this.onItemSwipedCallback);
          });
        });
      });
    });
  });

  function fakeLayoutEvent(instance, layout) {
    instance.props().onLayout({
      nativeEvent: { layout }
    });
  }
});
