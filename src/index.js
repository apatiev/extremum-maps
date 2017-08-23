'use strict';

var L = require('leaflet');
var map = require('./Map');
var placemark = require('./Placemark');
var tileLayer = require('./TileLayer');

require('leaflet-fullscreen');
require('leaflet-graphicscale');

require('leaflet/dist/leaflet.css');
require('leaflet-fullscreen/dist/leaflet.fullscreen.css');
require('leaflet-graphicscale/dist/Leaflet.GraphicScale.min.css');

// Forcibly load the marker icon images to be in the bundle.
require('leaflet/dist/images/marker-shadow.png');
require('leaflet/dist/images/marker-icon.png');
require('leaflet/dist/images/marker-icon-2x.png');

require('./styles/GraphicScale.css');

L.extremum = module.exports = {
    map: map.map,
    Map: map.Map,
    placemark: placemark.placemark,
    Placemark: placemark.Placemark,
    tileLayer: tileLayer.tileLayer,
    TileLayer: tileLayer.TileLayer
};
