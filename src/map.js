'use strict';

var L = require('leaflet');
var omnivore = require('@mapbox/leaflet-omnivore');

var Map = L.Map.extend({

    options: {},

    initialize: function (element, layersUrl, options) {
        L.Map.prototype.initialize.call(this, element, L.extend({}, L.Map.prototype.options, options));

        this._loadBaseLayerDefinitions(layersUrl)
            .then(L.bind(function (definition) {
                this._createBaseLayers(definition);
            }, this));

        this._tracksFeatureGroup = L.featureGroup();
        this._tracksFeatureGroup.addTo(this);

        this._placemarksFeatureGroup = L.featureGroup();
        this._placemarksFeatureGroup.addTo(this);
    },

    addTrack: function (url) {
        var customLayer = L.geoJson(null, {
            style: function (feature) {
                return {
                    color: feature.properties['stroke'],
                    width: feature.properties['stroke-width'],
                    opacity: feature.properties['opacity']
                };
            },

            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties['name']);
                layer.name = feature.properties['name'];
            }
        });

        var trackLayer = omnivore.kml(url, null, customLayer);

        trackLayer.addTo(this._tracksFeatureGroup);

        return this;
    },

    addPlacemark: function (lanlng, title, description) {
        var placemark = L.marker(lanlng, {
            title: title,
            alt: title,
            riseOnHover: true
        });

        placemark.bindPopup('<b>' + title + '</b><br>' + description);
        placemark.addTo(this._placemarksFeatureGroup);

        return this;
    },

    _loadBaseLayerDefinitions: function (url) {
        function checkStatus(response) {
            var error;

            if (response.status >= 200 && response.status < 300) {
                return response;
            }

            error = new Error(response.statusText);
            error.response = response;
            throw error;
        }

        return fetch(url)
            .then(checkStatus)
            .then(function (response) {
                return response.json();
            }).catch(function (ex) {
                console.error('Failed to load base layer definitions', ex);
            });
    },

    _createBaseLayers: function (definition) {
        var baseLayers = {};
        var baseLayer;
        var i, j;

        if (definition.constructor === Array && definition.length > 0) {
            for (i = 0; i < definition.length; ++i) {
                if ('group' in definition[i]) {
                    baseLayer = new L.LayerGroup();

                    for (j = 0; j < definition[i].group.length; ++j) {
                        baseLayer.addLayer(new L.TileLayer(
                            definition[i].group[j].url,
                            definition[i].group[j].options)
                        );
                    }
                } else {
                    baseLayer = new L.TileLayer(
                        definition[i].url,
                        definition[i].options);
                }

                baseLayers[definition[i].name] = baseLayer;
            }

            baseLayers[definition[0].name].addTo(this);

            this._layersControl = L.control.layers(baseLayers);
            this._layersControl.addTo(this);
        }
    }
});

module.exports.Map = Map;

module.exports.map = function (element, options) {
    return new Map(element, options);
};
