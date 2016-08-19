
/**
 * Dependencies
 */

const metadata = require('../../../../lib/scanner/metadata');
const assert = require('assert');
const sinon = require('sinon');

describe('metadata', () => {

  describe('serverside', function() {
    beforeEach(function() {
      this.sinon = sinon.sandbox.create();
      this.clock = this.sinon.useFakeTimers();

      global.Request = sinon.spy((url, config) => {
        return Object.assign({}, config, { url });
      });

      global.Headers = sinon.spy(config => config);

      global.fetch = sinon.spy(() => {
        this.lastFetch = new Deferred;
        return this.lastFetch.promise;
      });
    });

    afterEach(function() {

    });

    describe('batches', function() {
      beforeEach(function() {
        this.calls = [
          metadata('http://bbc.co.uk/news'),
          metadata('http://google.com')
        ];

        // tick past batch window
        this.clock.tick(200);
      });

      it('batches requests', function() {
        var request = global.fetch.lastCall.args[0];
        var body = JSON.parse(request.body);
        var urls = body.objects;

        assert.equal(urls[0].url, 'http://bbc.co.uk/news');
        assert.equal(urls[1].url, 'http://google.com');
      });

      describe('error', function() {
        beforeEach(function() {
          var result = Promise.resolve([
            {
              error: 'bad thing'
            },
            {
              title: 'Google'
            }
          ]);

          this.lastFetch.resolve({
            json: () => result
          });

          // wait till initial call has resolved
          return this.calls[1];
        });

        it('resolves the successful items', function() {
          return this.calls[1]
            .then(result => {
              assert.equal(result.title, 'Google');
            });
        });

        it('rejects the errored items', function() {
          return this.calls[0]
            .catch(err => {
              assert.equal(err.message, 'bad thing');
            });
        });
      })
    });
  });

  function Deferred() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
});
