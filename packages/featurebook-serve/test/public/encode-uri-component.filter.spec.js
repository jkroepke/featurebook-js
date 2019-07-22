'use strict';

describe('encodeURIComponent filter', function () {

  var encodeFilter;

  beforeEach(function () {
    angular.mock.module('scFeatureBook');

    angular.mock.inject(function ($filter) {
      encodeFilter = $filter('encodeURIComponent');
    });
  });

  it('should encode URI component', function () {
    expect(encodeFilter('/a/b/c')).toEqual('%2Fa%2Fb%2Fc');
  });

});
