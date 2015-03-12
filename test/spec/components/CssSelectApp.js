'use strict';

describe('Main', function () {
  var React = require('react/addons');
  var CssSelectApp, component;

  beforeEach(function () {
    var container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    CssSelectApp = require('../../../src/scripts/components/CssSelectApp.js');
    component = React.createElement(CssSelectApp);
  });

  it('should create a new instance of CssSelectApp', function () {
    expect(component).toBeDefined();
  });
});
