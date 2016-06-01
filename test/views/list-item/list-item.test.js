'use strict';

/**
 * Dependencies
 */

const ListItemView = require('../../../lib/views/list-item');
const ReactNative = require('react-native');
const assert = require('assert');
const enzyme = require('enzyme');
const sinon = require('sinon');
const React = require('react');

var {
  Linking
} = ReactNative;

describe('<ListItemView>', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.clock = this.sinon.useFakeTimers();
    this.itemData = {
      title: 'title',
      description: 'description',
      url: 'http://goo.gl/abc123',
      unadaptedUrl: 'http://mozilla.org'
    };

    this.onGestureEnd = sinon.spy();
    this.onPressed = sinon.spy();
    this.onSwiped = sinon.spy();

    this.sinon.spy(Linking, 'openURL');

    this.wrapper = enzyme.shallow(<ListItemView
      {...this.itemData}
      onGestureEnd={this.onGestureEnd}
      onSwiped={this.onSwiped}
      onPressed={this.onPressed}
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
    beforeEach(function() {
      this.props = {
        title: 'my title',
        embed: {},
        onPressed: sinon.spy()
      };

      this.wrapper = enzyme.shallow(<ListItemView {...this.props}/>);
      this.intance = this.wrapper.instance();
    });

    it('renders an <ContentViewEmbed>', function() {
      expect(this.wrapper.find('ContentViewEmbed')).to.have.length(1);
    });

    describe('expanded', function() {
      beforeEach(function() {
        this.wrapper.setProps({
          expanded: true
        });
      });
    });

    describe('.onTapped()', function() {
      beforeEach(function() {
        this.instance.onTapped();
      });

      it('does call the `props.onPressed()`', function() {
        sinon.assert.notCalled(this.props.onPressed);
      });

      it('does not navigate to the url`', function() {
        sinon.assert.notCalled(Linking.openURL);
      });
    });
  });

  describe('static', function() {
    beforeEach(function() {
      this.props = {
        title: 'my title',
        onPressed: sinon.spy(),
        unadaptedUrl: 'http://mozilla.org'
      };

      this.wrapper = enzyme.shallow(<ListItemView {...this.props}/>);
      this.instance = this.wrapper.instance();
    });

    it('renders an <ContentViewStatic>', function() {
      expect(this.wrapper.find('ContentViewStatic')).to.have.length(1);
    });

    describe('expanded', function() {
      beforeEach(function() {
        this.wrapper.setProps({
          expanded: true
        });
      });

      describe('.onTapped()', function() {
        beforeEach(function() {
          this.instance.onTapped();
        });

        it('does not call the `props.onPressed()`', function() {
          sinon.assert.notCalled(this.props.onPressed);
        });

        it('navigates to the url`', function() {
          sinon.assert.calledWith(Linking.openURL, this.props.unadaptedUrl);
        });
      });
    });
  });

  describe('swiping', function() {
    beforeEach(function() {
      var panHandlers = this.instance.panHandlers;
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

    describe('expanded', function() {
      beforeEach(function() {
        this.wrapper.setProps({
          expanded: true
        });
      });

      it('does not ever set pan move responder', function() {
        assert(!this.onMoveShouldSet({}, { dx: 7, dy: 0 }));
        assert(!this.onMoveShouldSet({}, { dx: 10, dy: 0 }));
        assert(!this.onMoveShouldSet({}, { dx: 20, dy: 0 }));
      });
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
          var padding = 11;
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
        sinon.assert.calledWith(this.onPressed, this.instance);
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

      it('does not call the props.onPressed() callback', function() {
        sinon.assert.notCalled(this.onPressed);
      });
    });
  });
});
