'use strict';

var L = require('leaflet');

var Placemark = L.Marker.extend({

    options: {
    },

    initialize: function (latlng, title, description, options) {
        var popupContent;

        options = options || {};

        if (!('title' in options)) {
            options['title'] = title;
        }

        if (!('alt' in options)) {
            options['alt'] = title;
        }

        L.Marker.prototype.initialize.call(this, latlng, L.extend({}, L.Marker.prototype.options, options));

        if (title) {
            popupContent = '<b>' + title + '</b>';

            if (description) {
                popupContent += '</b><br>' + description;
            }
        }

        if (popupContent) {
            this.bindPopup(popupContent);
        }
    },

    addTo: function (map) {
        if (map._placemarksGroup !== undefined) {
            map._placemarksGroup.addLayer(this);
        } else {
            map.addLayer(this);
        }

        return this;
    }
});

module.exports.Placemark = Placemark;

module.exports.placemark = function (latlng, title, description, options) {
    return new Placemark(latlng, title, description, options);
};
