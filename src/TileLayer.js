'use strict';

var L = require('leaflet');

var TileLayer = L.TileLayer.extend({

    options: {
        crs: L.CRS.EPSG3857
    },

    initialize: function (urlTemplate, options) {
        var crsNameMap = {
            'Earth': L.CRS.Earth,
            'EPSG3395': L.CRS.EPSG3395,
            'EPSG3857': L.CRS.EPSG3857,
            'EPSG900913': L.CRS.EPSG900913,
            'EPSG4326': L.CRS.EPSG4326,
            'Simple': L.CRS.Simple
        };

        if ('crs' in options) {
            options.crs = crsNameMap[options.crs];
        }

        L.TileLayer.prototype.initialize.call(this, urlTemplate, options);
    }
});

module.exports.TileLayer = TileLayer;

module.exports.tileLayer = function (urlTemplate, options) {
    return new TileLayer(urlTemplate, options);
};
