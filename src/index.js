'use strict';

var L = require('leaflet');
var map = require('./Map');
var placemark = require('./Placemark');
var tileLayer = require('./TileLayer');

require('leaflet-fullscreen');

L.extremum = module.exports = {
    map: map.map,
    Map: map.Map,
    placemark: placemark.placemark,
    Placemark: placemark.Placemark,
    tileLayer: tileLayer.tileLayer,
    TileLayer: tileLayer.TileLayer
};
