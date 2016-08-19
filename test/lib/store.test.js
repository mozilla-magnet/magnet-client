
/**
 * Dependencies
 */

const actionCreators = require('../../lib/store/action-creators');
const { createStore, bindActionCreators } = require('redux');
const reducer = require('../../lib/store/reducer');
const assert = require('assert');

describe('store', function() {
  beforeEach(function() {
    this.store = createStore(reducer);
    this.actions = bindActionCreators(actionCreators, this.store.dispatch);
  });

  describe('distance', function() {
    var url = 'https://foo.com';

    describe('first', function() {
      beforeEach(function() {
        this.actions.updateItem(url, {
          url,
          id: url,
          distance: 3
        });
      });

      it('sets correct distance', function() {
        var item = getItem(this.store.getState().items, url);
        var expected = [3];

        assert.deepEqual(item.distances, expected);
        assert.equal(item.regulatedDistance, meanToNearest(expected, 2));
      });

      describe('second', function() {
        beforeEach(function() {
          this.actions.updateItem(url, { distance: 4 });
        });

        it('sets correct distance', function() {
          var item = getItem(this.store.getState().items, url);
          var expected = [3, 4];

          assert.deepEqual(item.distances, expected);
          assert.equal(item.regulatedDistance, meanToNearest(expected, 2));
        });

        describe('third', function() {
          beforeEach(function() {
            this.actions.updateItem(url, {
              distance: 3
            });
          });

          it('sets correct distance', function() {
            var item = getItem(this.store.getState().items, url);
            var expected = [3, 4, 3];

            assert.deepEqual(item.distances, expected);
            assert.equal(item.regulatedDistance, meanToNearest(expected, 2));
          });

          describe('fourth', function() {
            beforeEach(function() {
              this.actions.updateItem(url, {
                distance: 7
              });
            });

            it('sets correct distance', function() {
              var item = getItem(this.store.getState().items, url);
              var expected = [3, 4, 3, 7];

              assert.deepEqual(item.distances, expected);
              assert.equal(item.regulatedDistance, meanToNearest(expected, 2));
            });

            describe('fifth', function() {
              beforeEach(function() {
                this.actions.updateItem(url, { distance: 4 });
              });

              it('sets correct distance', function() {
                var item = getItem(this.store.getState().items, url);
                var expected = [3, 4, 3, 7, 4];

                assert.deepEqual(item.distances, expected);
                assert.equal(item.regulatedDistance, meanToNearest(expected, 2));
              });

              describe('sixth', function() {
                beforeEach(function() {
                  this.actions.updateItem(url, { distance: 4 });
                });

                it('sets correct distance', function() {
                  var item = getItem(this.store.getState().items, url);
                  var expected = [4, 3, 7, 4, 4];

                  assert.deepEqual(item.distances, expected);
                  assert.equal(item.regulatedDistance, meanToNearest(expected, 2));
                });
              });
            });
          });
        });
      });
    });
  });

  function getItem(items, id) {
    return items.find(item => item.id === id);
  }

  function meanToNearest(numbers, nearest) {
    return toNearest(getMean(numbers), nearest);
  }

  function getMean(numbers) {
    return numbers.reduce((result, number) => {
      return result + number;
    }, 0) / numbers.length;
  }

  function toNearest(number, nearest) {
    return Math.round(number / nearest) * nearest;
  }
});
