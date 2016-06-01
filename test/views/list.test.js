'use strict';

/**
 * Dependencies
 */

const ListView = require('../../lib/views/list');
const assert = require('assert');
const enzyme = require('enzyme');
const sinon = require('sinon');
const React = require('react');

const LIST_VIEW_WIDTH = 300;
const LIST_VIEW_HEIGHT = 500;

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
      this.wrapper = enzyme.shallow(<ListView
        items={[{ id: 1 }, { id: 2 }, { id: 3 }]}
        onItemSwiped={this.onItemSwipedCallback}
        contentOffsetY={50}
      />);

      this.scrollView = this.wrapper.find('ScrollView');
      this.contentView = this.wrapper.findWhere(el => el.props().testId === 'content');
      this.instance = this.wrapper.instance();

      fakeLayoutEvent(this.scrollView, {
        width: LIST_VIEW_WIDTH,
        height: LIST_VIEW_HEIGHT
      });

      fakeLayoutEvent(this.contentView, {
        width: LIST_VIEW_WIDTH,
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

    describe('.expand()', function() {
      beforeEach(function() {
        this.sinon.spy(this.instance, 'setState');
        return this.instance.expand({ props: { id: 1 }})
          .then(() => {
            this.stateUpdate = this.instance.setState.lastCall.args[0];
          });
      });

      it('it updates the `expandedItem` state', function() {
        assert.equal(this.stateUpdate.expandedItem.id, 1);
        assert.equal(this.stateUpdate.expandedItem.viewportOffsetY, 100);
      });

      it('prevents the container scrolling', function() {
        assert.equal(this.stateUpdate.scrollable, false);
      });

      describe('expanded', function() {
        beforeEach(function() {
          this.wrapper.setState(this.stateUpdate);
        });

        it('adds padding-top to expanded item to push previous item up', function() {
          var expandedItem = this.wrapper.find('[testId="item-wrapper"]').first();
          var style = getStyle(expandedItem);
          assert.equal(style.paddingTop, 50);
        });

        it('offsets the list content', function() {
          var content = this.wrapper.find('[testId="content"]').first();
          var style = getStyle(content);
          assert.equal(style.marginTop, -100);
        });

        it('expands the item to fill the scroll viewport height', function() {
          var expandedItem = this.wrapper.find('[testId="item-wrapper"]').first();
          var style = getStyle(expandedItem);
          assert.equal(style.height, LIST_VIEW_HEIGHT);
        });

        describe('expanding the same item', function() {
          beforeEach(function() {
            this.instance.setState.reset();
            return this.instance.expand({ props: { id: 1 }});
          });

          it('does nothing', function() {
            sinon.assert.notCalled(this.instance.setState);
          });
        });

        describe('.contract()', function() {
          beforeEach(function() {
            this.instance.setState.reset();
            return this.instance.contract()
              .then(() => {
                this.stateUpdate = this.instance.setState.lastCall.args[0];
              });
          });

          it('clears the expandedItem state', function() {
            assert.equal(this.stateUpdate.expandedItem, null);
          });

          it('makes the item scrollable again', function() {
            assert.equal(this.stateUpdate.scrollable, true);
          });

          describe('contracted', function() {
            beforeEach(function() {
              this.wrapper.setState(this.stateUpdate);
            });

            it('removes padding-top from expanded item', function() {
              var expandedItem = this.wrapper.find('[testId="item-wrapper"]').first();
              var style = getStyle(expandedItem);
              assert.equal(style.paddingTop, undefined);
            });

            it('removes the the list content offset', function() {
              var content = this.wrapper.find('[testId="content"]').first();
              var style = getStyle(content);
              assert.equal(style.marginTop, undefined);
            });

            it('returns the item-wrapper to its natural height', function() {
              var expandedItem = this.wrapper.find('[testId="item-wrapper"]').first();
              var style = getStyle(expandedItem);
              assert.equal(style.height, undefined);
            });
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

  function getStyle(el) {
    var style = [].concat(el.props().style);
    return Object.assign.apply(null, style);
  }
});
