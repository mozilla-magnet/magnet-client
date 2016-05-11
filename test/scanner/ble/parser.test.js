
/**
 * Dependencies
 */

const parse = require('../../../lib/scanner/ble/parser');

describe('ble parser', () => {
  it('should decode a uri beacon', function() {
    var result = parse({
      bytes: [0x03,0x03,0xD8,0xFE,0x0E,0x16,0xD8,0xFE,0x00,0x00,0x03,0x6D,0x6F,0x7A,0x69,0x6C,0x6C,0x61,0x07]
    });

    expect(result).to.be.deep.equal({
      url: 'https://mozilla.com',
      distance: Number.NaN
    });
  });
});