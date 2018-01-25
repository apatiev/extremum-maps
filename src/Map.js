'use strict';

var L = require('leaflet');
var omnivore = require('@mapbox/leaflet-omnivore');

var Map = L.Map.extend({

    options: {},

    initialize: function (element, layersUrl, options) {
        L.Map.prototype.initialize.call(this, element, L.extend({}, L.Map.prototype.options, options));

        this._tracksGroup = L.featureGroup();
        this._tracksGroup.addTo(this);

        this._placemarksGroup = L.featureGroup();
        this._placemarksGroup.addTo(this);

        this.addControl(new L.Control.Fullscreen());
        this.addControl(new L.extremum.Control.Measure());
        this.addControl(new L.Control.GraphicScale({
            fill: 'hollow',
            subUnits: true
        }));

        this.on('baselayerchange', L.bind(function (event) {
            this._onBaseLayerChange(event);
        }, this));

        this._loadBaseLayerDefinitions(layersUrl)
            .then(L.bind(function (definition) {
                this._createBaseLayers(definition);
            }, this));
    },

    addTrack: function (url) {
        var customLayer = L.geoJson(null, {
            style: function (feature) {
                return {
                    color: feature.properties.stroke,
                    width: feature.properties['stroke-width'],
                    opacity: feature.properties.opacity
                };
            },

            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.name);
            }
        });

        var trackLayer = omnivore.kml(url, null, customLayer);

        trackLayer.addTo(this._tracksGroup);

        return this;
    },

    addPlacemark: function (lanlng, title, description, options) {
        L.extremum.placemark(lanlng, title, description, options).addTo(this);
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
        var newBaseLayer;
        var firstBaseLayer;
        var i, j;

        if (definition.constructor === Array && definition.length > 0) {
            for (i = 0; i < definition.length; ++i) {
                if (definition[i].group !== undefined) {
                    newBaseLayer = new L.LayerGroup();

                    for (j = 0; j < definition[i].group.length; ++j) {
                        newBaseLayer.addLayer(new L.extremum.TileLayer(
                            definition[i].group[j].url,
                            definition[i].group[j].options)
                        );
                    }
                } else {
                    newBaseLayer = new L.extremum.TileLayer(
                        definition[i].url,
                        definition[i].options);
                }

                baseLayers[definition[i].name] = newBaseLayer;
            }

            firstBaseLayer = baseLayers[definition[0].name];
            firstBaseLayer.addTo(this);

            this._setCRSFromLayer(firstBaseLayer);

            this._layersControl = L.control.layers(baseLayers);
            this._layersControl.addTo(this);
        }
    },

    _setCRSFromLayer: function (layer) {
        var center;
        var layers;
        var crs;
        var i;

        if (layer instanceof L.extremum.TileLayer) {
            crs = layer.options.crs;

            if (crs !== null && crs !== this.options.crs) {
                center = this.getCenter();
                this.options.crs = crs;
                this.setView(center);
                this._resetView(this.getCenter(), this.getZoom());
            }

        } else if (layer instanceof L.LayerGroup) {
            layers = layer.getLayers();

            for (i = 0; i < layers.length; ++i) {
                crs = this._setCRSFromLayer(layers[i]);
                if (crs !== null) {
                    break;
                }
            }
        }

        return crs;
    },

    _onBaseLayerChange: function (e) {
        this._setCRSFromLayer(e.layer);
    }
});

module.exports.Map = Map;

module.exports.map = function (element, options) {
    return new Map(element, options);
};
