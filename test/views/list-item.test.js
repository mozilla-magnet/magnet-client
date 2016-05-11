'use strict';

/**
 * Dependencies
 */

const ListItemView = require('../../lib/views/list-item');
const ReactNative = require('react-native');
const assert = require('assert');
const enzyme = require('enzyme');
const sinon = require('sinon');
const React = require('react');

var {
  Animated,
  Linking
} = ReactNative;

describe('<ListItemView>', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.clock = this.sinon.useFakeTimers();
    this.itemData = {
      title: 'title',
      description: 'description',
      url: 'http://mozilla.org'
    };

    this.onGestureEnd = sinon.spy();
    this.onSwiped = sinon.spy();

    this.wrapper = enzyme.shallow(<ListItemView
      {...this.itemData}
      onGestureEnd={this.onGestureEnd}
      onSwiped={this.onSwiped}
    />);

    this.instance = this.wrapper.instance();

    // fake layout event
    this.instance.onLayout({
      nativeEvent: {
        layout: {
          width: 300,
          height: 100
        }
      }
    });
  });

  afterEach(function() {
    this.sinon.restore();
  });

  it('stores height on layout', function() {
    assert.equal(this.instance.height, 100);
  });

  describe('embed', function() {
    it('renders an <ContentViewEmbed>', function() {
      var data = { title: 'my title', embed: {}};
      var wrapper = enzyme.shallow(<ListItemView {...data}/>);
      expect(wrapper.find('ContentViewEmbed')).to.have.length(1);
    });
  });

  describe('static', function() {
    it('renders an <ContentViewStatic>', function() {
      var data = { title: 'my title' };
      this.wrapper = enzyme.shallow(<ListItemView {...data}/>);
      expect(this.wrapper.find('ContentViewStatic')).to.have.length(1);
    });
  });

  describe('swiping', function() {
    beforeEach(function() {
      var panHandlers = this.instance.panResponder.panHandlers;
      this.onMoveShouldSet = panHandlers.onMoveShouldSetPanResponder;
      this.onPanResponderRelease = panHandlers.onPanResponderRelease;
      this.onPanResponderTerminate = panHandlers.onPanResponderTerminate;

      this.sinon.spy(this.instance, 'swipeAway');
      this.sinon.spy(this.instance, 'snapBack');
    });

    it('does not begin until dx > 6', function() {
      assert(!this.onMoveShouldSet({}, { dx: 1, dy: 0 }));
      assert(!this.onMoveShouldSet({}, { dx: 2, dy: 0 }));
      assert(!this.onMoveShouldSet({}, { dx: 3, dy: 0 }));
      assert(!this.onMoveShouldSet({}, { dx: 4, dy: 0 }));
      assert(!this.onMoveShouldSet({}, { dx: 5, dy: 0 }));
      assert(!this.onMoveShouldSet({}, { dx: 6, dy: 0 }));
      assert(this.onMoveShouldSet({}, { dx: 7, dy: 0 }));
    });

    it('does not begin if dy > 4', function() {
      assert(!this.onMoveShouldSet({}, { dx: -7, dy: -6 }));
      assert(this.onMoveShouldSet({}, { dx: -7, dy: -4 }));
    });

    describe('swipe away', function() {
      beforeEach(function() {
        this.pan = this.instance.state.pan;
        this.sinon.stub(this.pan, 'addListener').returns(1);
        this.sinon.stub(this.pan, 'stopAnimation');
        this.sinon.stub(this.pan, 'removeListener');
        this.onPanResponderRelease({}, { vx: 1.5 });
      });

      it('calls props.onGestureEnd()', function() {
        sinon.assert.calledOnce(this.onGestureEnd);
      });

      describe('after animation', function() {
        beforeEach(function() {
          var padding = 14;
          var maxX = this.instance.width + padding;
          var minX = -maxX;
          var x = minX;

          // try all below threshold values
          while (++x < maxX) {
            this.pan.addListener.yield({ x });
            sinon.assert.notCalled(this.onSwiped);
          }

          // push over max-x threshold
          this.pan.addListener.yield({ x: ++x });
        });

        it('calls props.onSwiped()', function() {
          sinon.assert.calledOnce(this.onSwiped);
          sinon.assert.calledWith(this.onSwiped, this.instance);
        });

        it('removes the pan listener', function() {
          sinon.assert.calledWith(this.pan.removeListener, 1);
        });

        it('removes stops the animation', function() {
          sinon.assert.calledOnce(this.pan.stopAnimation);
        });
      });
    });

    it('swipes away item if velocity is great enough', function() {
      this.onPanResponderRelease({}, { vx: 1.5 });
      sinon.assert.calledOnce(this.instance.swipeAway);
    });

    it('snaps back if velocity is not great enough', function() {
      this.onPanResponderRelease({}, { vx: 0.5 });
      sinon.assert.calledOnce(this.instance.snapBack);
    });

    describe('props.onGestureEnd()', function() {
      it('called on snap back', function() {
        this.onPanResponderRelease({}, { vx: 0.5 });
        sinon.assert.calledOnce(this.onGestureEnd);
      });


      it('called on terminate', function() {
        this.onPanResponderTerminate({}, { vx: 1.5 });
        sinon.assert.calledOnce(this.onGestureEnd);
      });
    });
  });

  describe('taps', function() {
    beforeEach(function() {
      this.inner = this.wrapper.findWhere(el => el.props().testId === 'inner');
      this.onResponderGrant = this.inner.props().onResponderGrant;
      this.onResponderRelease = this.inner.props().onResponderRelease;
      this.sinon.spy(Linking, 'openURL');

      // touchstart
      this.onResponderGrant({
        nativeEvent: {
          timestamp: Date.now()
        }
      });
    });

    describe('quick tap (< 250ms)', function() {
      beforeEach(function() {
        this.clock.tick(150);

        // touchend
        this.onResponderRelease({
          nativeEvent: {
            timestamp: Date.now()
          }
        });
      });

      it('navigates to url when static item pressed', function() {
        sinon.assert.calledWith(Linking.openURL, this.itemData.url);
      });
    });

    describe('longer press (> 250ms)', function() {
      beforeEach(function() {
        this.clock.tick(300);

        // touchend
        this.onResponderRelease({
          nativeEvent: {
            timestamp: Date.now()
          }
        });
      });

      it('navigates to url when static item pressed', function() {
        sinon.assert.notCalled(Linking.openURL);
      });
    });
  });
});
