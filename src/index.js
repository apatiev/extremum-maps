'use strict';

var L = require('leaflet');
var map = require('./map');

L.extremum = module.exports = {
    map: map.map,
    Map: map.Map
};
