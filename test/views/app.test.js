'use strict';

/**
 * Dependencies
 */

const Scanner = require('../../lib/scanner');
const App = require('../../lib/views/app');
const ReactNative = require('react-native');
const assert = require('assert');
const enzyme = require('enzyme');
const sinon = require('sinon');
const React = require('react');

describe('<App>', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.clock = this.sinon.useFakeTimers();

    this.scanner = sinon.createStubInstance(Scanner);

    this.scanner.start.returns(Promise.resolve());

    // re-enable event emitter for testing
    this.scanner.emit.restore();
    this.scanner.on.restore();

    this.scanner.scan = sinon.spy(ms => {
      var defer = this.scanDefer = new Deferred();
      setTimeout(defer.resolve, ms);
      return defer.promise;
    });

    this.wrapper = enzyme.shallow(<App scanner={this.scanner}/>);
    this.instance = this.wrapper.instance();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('state', function() {
    it('sets `items` on <ListView>', function() {
      var props = this.wrapper.find('ListView').props().items;
      var state = this.wrapper.state().items;
      assert.equal(props, state);
    });
  });

  describe('componentDidMount', function() {
    beforeEach(function() {
      sinon.assert.notCalled(this.scanner.start);
      this.instance.componentDidMount();
    });

    describe('scan', function() {
      it('starts scanning', function() {
        sinon.assert.calledOnce(this.scanner.start);
      });

      it('sets the `initialScanPeriod` to true', function() {
        assert.equal(this.wrapper.state('initialScanPeriod'), true);
      });

      describe('after 8 secs', function() {
        beforeEach(function() {
          this.clock.tick(8000);
        });

        it('sets the `initialScanPeriod` to `false`', function() {
          assert.equal(this.wrapper.state('initialScanPeriod'), false);
        });
      });
    });
  });

  describe('items found', function() {
    beforeEach(function() {
      this.items = [{},{},{}];
      this.scanner.emit('update', this.items);
    });

    it('updates the state', function() {
      assert.equal(this.wrapper.state('items'), this.items);
    });
  });

  describe('network error', function() {
    beforeEach(function() {
      this.spy = this.sinon.spy(ReactNative.Alert, 'alert');
      this.scanner.emit('networkerror');
    });

    it('shows an alert', function() {
      sinon.assert.calledOnce(this.spy);
    });
  });

  /**
   * Utils
   */

  function Deferred() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
});
