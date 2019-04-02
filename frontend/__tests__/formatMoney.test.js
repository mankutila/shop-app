import formatMoney from '../lib/formatMoney';

describe('formatMoney function', function () {
  // test fails when using currency different from USD - Intl issue on nodejs
  xit('should work with fractional money', function () {
    expect(formatMoney(1)).toEqual('BYN 0.01');
    expect(formatMoney(10)).toEqual('BYN 0.10');
    expect(formatMoney(9)).toEqual('BYN 0.09');
    expect(formatMoney(40)).toEqual('BYN 0.40');
  });

  xit('should leave cents off whole dollars', function () {
    expect(formatMoney(5000)).toEqual('BYN 50');
    expect(formatMoney(100)).toEqual('BYN 1');
    expect(formatMoney(5000000)).toEqual('BYN 5000');
  });
});
