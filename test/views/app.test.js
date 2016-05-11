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

    // re-enable event emitter for testing
    this.scanner.emit.restore();
    this.scanner.on.restore();

    this.scanner.scan = sinon.spy(ms => {
      var defer = this.scanDefer = new Deferred();
      setTimeout(defer.resolve, ms);
      return defer.promise;
    });

    this.wrapper = enzyme.shallow(<App scanner={this.scanner}/>);
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

  describe('scan', function() {
    beforeEach(function() {
      sinon.assert.notCalled(this.scanner.scan);
      this.clock.tick(500);
    });

    it('starts scanning after 500ms', function() {
      sinon.assert.calledOnce(this.scanner.scan);
    });

    it('sets the scanning state to true', function() {
      assert.equal(this.wrapper.state('scanning'), true);
    });

    describe('after scan', function() {
      beforeEach(function() {
        this.clock.tick(8000);
        return this.scanDefer.promise;
      });

      it('scans for 10 seconds', function() {
        assert.equal(this.wrapper.state('scanning'), false);
      });

      describe('after wait', function() {
        beforeEach(function() {
          assert.equal(this.wrapper.state('scanning'), false);
          this.clock.tick(30000);
        });

        it('waits 30 seconds between scans', function() {
          assert.equal(this.wrapper.state('scanning'), true);
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
