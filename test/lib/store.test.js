jest.mock('../../lib/utils/tracker');

/**
 * Dependencies
 */

import { createStore, bindActionCreators, applyMiddleware } from 'redux';
import actions from '../../lib/store/actions';
import reducer from '../../lib/store/reducer';
import thunk from 'redux-thunk';
import assert from 'assert';

describe('store', function() {
  beforeEach(function() {
    this.store = createStore(reducer, applyMiddleware(thunk));
    this.actions = bindActionCreators(actions, this.store.dispatch);
  });

  describe('distance', function() {
    var url = 'https://foo.com';

    describe('first', function() {
      beforeEach(function() {
        this.actions.itemFound(url, {
          url,
          id: url,
          distance: 3,
        });
      });

      it('sets correct distance', function() {
        var item = getItem(this.store.getState().items, url).value;
        var expected = [3];

        assert.deepEqual(item._distanceHistory, expected);
        assert.equal(item.distance, meanToNearest(expected, 2));
      });

      describe('second', function() {
        beforeEach(function() {
          this.actions.itemFound(url, { distance: 4 });
        });

        it('sets correct distance', function() {
          var item = getItem(this.store.getState().items, url).value;
          var expected = [3, 4];

          assert.deepEqual(item._distanceHistory, expected);
          assert.equal(item.distance, meanToNearest(expected, 2));
        });

        describe('third', function() {
          beforeEach(function() {
            this.actions.itemFound(url, {
              distance: 3,
            });
          });

          it('sets correct distance', function() {
            var item = getItem(this.store.getState().items, url).value;
            var expected = [3, 4, 3];

            assert.deepEqual(item._distanceHistory, expected);
            assert.equal(item.distance, meanToNearest(expected, 2));
          });

          describe('fourth', function() {
            beforeEach(function() {
              this.actions.itemFound(url, {
                distance: 7,
              });
            });

            it('sets correct distance', function() {
              var item = getItem(this.store.getState().items, url).value;
              var expected = [3, 4, 3, 7];

              assert.deepEqual(item._distanceHistory, expected);
              assert.equal(item.distance, meanToNearest(expected, 2));
            });

            describe('fifth', function() {
              beforeEach(function() {
                this.actions.itemFound(url, { distance: 4 });
              });

              it('sets correct distance', function() {
                var item = getItem(this.store.getState().items, url).value;
                var expected = [3, 4, 3, 7, 4];

                assert.deepEqual(item._distanceHistory, expected);
                assert.equal(item.distance, meanToNearest(expected, 2));
              });

              describe('sixth', function() {
                beforeEach(function() {
                  this.actions.itemFound(url, { distance: 4 });
                });

                it('sets correct distance', function() {
                  var item = getItem(this.store.getState().items, url).value;
                  var expected = [4, 3, 7, 4, 4];

                  assert.deepEqual(item._distanceHistory, expected);
                  assert.equal(item.distance, meanToNearest(expected, 2));
                });
              });
            });
          });
        });
      });
    });
  });

  function getItem(items, id) {
    return items[id];
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
