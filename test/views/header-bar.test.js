'use strict';

/**
 * Dependencies
 */

const replace = require('module-replace')({ root: __dirname });
const ReactNative = require('react-native');
const enzyme = require('enzyme');
const sinon = require('sinon');
const React = require('react');

const { Animated } = ReactNative;

/**
 * Requiring images doen't work outside
 * of the React-Native packager, so we're
 * replacing them with strings.
 */

replace
  .module('../../lib/images/header-bar-logo.png')
  .exports('header-bar-logo.png');

replace
  .module('../../lib/images/header-bar-close.png')
  .exports('header-bar-close.png');

replace
  .module('../../lib/images/header-bar-hamburger.png')
  .exports('header-bar-hamburger.png');

replace
  .module('../../lib/images/header-bar-more.png')
  .exports('header-bar-more.png');

// require after replacements defined
const HeaderBarView = require('../../lib/views/header-bar');

describe('<HeaderBarView>', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.clock = this.sinon.useFakeTimers();

    this.props = {
      onHamburgerPressed: sinon.spy(),
      onClosePressed: sinon.spy(),
      onMorePressed: sinon.spy(),
      scanning: false,
      expandedMode: false
    };

    this.wrapper = enzyme.shallow(<HeaderBarView {...this.props}/>);
    this.instance = this.wrapper.instance();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('!expandedMode', function() {
    describe('hamburger-button', function() {
      beforeEach(function() {
        this.hamburgerButton = findNode(this.wrapper, 'hamburger-button');
      });

      it.skip('renders the hamburger button', function() {
        expect(this.hamburgerButton).to.have.length(1);
      });
    });
  });

  describe('expandedMode', function() {
    beforeEach(function() {
      this.props.expandedMode = true;
      this.wrapper.setProps(this.props);
    });

    describe('hamburger-button', function() {
      beforeEach(function() {
        this.hamburgerButton = findNode(this.wrapper, 'hamburger-button');
      });

      it('does not render the hamburger button', function() {
        expect(this.hamburgerButton).to.have.length(0);
      });
    });

    describe('close-button', function() {
      beforeEach(function() {
        this.closeButton = findNode(this.wrapper, 'close-button');
      });

      it('renders the close button', function() {
        expect(this.closeButton).to.have.length(1);
      });

      describe('on press', function() {
        beforeEach(function() {
          this.closeButton.simulate('press');
        });

        it('calls props.onClosePressed()', function() {
          sinon.assert.calledOnce(this.props.onClosePressed)
        });
      });
    });

    describe('more-button', function() {
      beforeEach(function() {
        this.moreButton = findNode(this.wrapper, 'more-button');
      });

      it('renders the more button', function() {
        expect(this.moreButton).to.have.length(1);
      });

      describe('on press', function() {
        beforeEach(function() {
          this.moreButton.simulate('press');
        });

        it('calls props.onMorePressed()', function() {
          sinon.assert.calledOnce(this.props.onMorePressed)
        });
      });
    });
  });

  describe('scanning', function() {
    beforeEach(function() {
      this.sinon.spy(this.instance, 'animateLoading');
      this.props.scanning = true;
      this.wrapper.setProps(this.props);
    });

    it('it animates the loading indicator', function() {
      sinon.assert.calledOnce(this.instance.animateLoading);
    });

    it('it loops until !scanning ', function() {

      // first
      sinon.assert.calledOnce(this.instance.animateLoading);
      this.instance.animateLoading.reset()
      Animated.timing._start.yield(); // << done callback
      this.clock.tick(1000);

      // second
      sinon.assert.calledOnce(this.instance.animateLoading);
      this.instance.animateLoading.reset()
      Animated.timing._start.yield(); // << done callback
      this.clock.tick(1000);

      // third
      sinon.assert.calledOnce(this.instance.animateLoading);
      this.instance.animateLoading.reset()

      // stop scanning
      this.wrapper.setProps({ scanning: false });

      Animated.timing._start.yield(); // << done callback
      this.clock.tick(1000);

      sinon.assert.notCalled(this.instance.animateLoading);
    });
  });

  /**
   * Utils
   */

  function findNode(wrapper, testId) {
    return wrapper.findWhere(node => {
      return node.props().testId === testId;
    });
  }
});
