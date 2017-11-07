'use strict';

var L = require('leaflet');

var Measure = L.Control.extend({

    options: {
        position: 'topleft',
        title: {
            'false': 'Линейка',
            'true': 'Линейка'
        }
    },

    initialize: function (options) {
        L.setOptions(this, options);

        this._layers = L.layerGroup();
        this._measurePoints = [];
        this._measuring = false;
        this._distance = 0;
    },

    onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-extremum-control-measure leaflet-bar leaflet-control');

        this._link = L.DomUtil.create('a', 'leaflet-extremum-control-measure-button leaflet-bar-part', this._container);
        this._link.href = '#';
        this._updateTitle();

        this._layers.addTo(map);

        L.DomEvent
            .on(this._link, 'click', L.DomEvent.stopPropagation)
            .on(this._link, 'click', L.DomEvent.preventDefault)
            .on(this._link, 'click', this._toggleMeasure, this)
            .on(this._link, 'dblclick', L.DomEvent.stopPropagation);

        return this._container;
    },

    _toggleMeasure: function (e) {
        var container = this._map.getContainer();

        this._measuring = !this._measuring;
        this._updateTitle();

        if (this._measuring) {
            this._startMeasuring();
            L.DomUtil.addClass(container, 'leaflet-extremum-measure-on');
        } else {
            this._stopMeasuring();
            L.DomUtil.removeClass(container, 'leaflet-extremum-measure-on');
        }
    },

    _startMeasuring: function () {
        this._oldCursor = this._map._container.style.cursor;
        this._oldDoubleClickZoomEnabled = this._map.doubleClickZoom.enabled();

        this._map._container.style.cursor = 'crosshair';
        this._map.doubleClickZoom.disable();

        L.DomEvent
            .on(this._map, 'click', this._addPoint, this);
    },

    _stopMeasuring: function () {
        this._map._container.style.cursor = this._oldCursor;

        L.DomEvent
            .off(this._map, 'click', this._addPoint, this);

        if (this._oldDoubleClickZoomEnabled) {
            this._map.doubleClickZoom.enable();
        }

        this._resetPath();
    },

    _addPoint: function (e) {
        var prevPoint;
        var point;

        if (!e.latlng) {
            return;
        }

        if (this._measurePath) {
            this._measurePath.addLatLng(e.latlng);
        } else {
            this._measurePath = L.polyline([e.latlng], {
                weight: 3,
                color: '#3388ff'
            }).addTo(this._layers);
        }

        point = L.circleMarker(e.latlng, {
            radius: 5,
            weight: 2,
            color: '#525252',
            fill: true,
            fillColor: '#ffffff',
            fillOpacity: 1.0
        }).addTo(this._layers);

        if (this._measurePoints.length > 0) {
            prevPoint = this._measurePoints[this._measurePoints.length - 1];
            prevPoint.off('popupclose', this._resetPath, this);
            prevPoint.closePopup();

            this._distance += this._calcDistance(prevPoint, point);

            point.bindPopup(this._formatDistance(this._distance), {
                minWidth: 30,
                autoClose: false,
                closeOnClick: false,
                className: 'leaflet-extremum-measure-popup'
            }).openPopup();

            point.on('popupclose', this._resetPath, this);
        }

        this._measurePoints.push(point);

        L.DomEvent
            .on(point, 'click', L.DomEvent.stopPropagation)
            .on(point, 'dblclick', this._removePoint, this)
            .on(point, 'dblclick', L.DomEvent.stopPropagation);
    },

    _removePoint: function (e) {
        var point = e.target;

        this._measurePoints = this._measurePoints.filter(function (t) {
            return t !== point;
        });

        this._updatePath();

        point.remove();
    },

    _updatePath: function () {
        var measurePointsLatLngs = [];
        var popup;
        var i;

        this._distance = 0;

        for (i = 0; i < this._measurePoints.length; ++i) {
            measurePointsLatLngs.push(this._measurePoints[i].getLatLng());

            if (i > 0) {
                this._distance += this._calcDistance(
                    this._measurePoints[i - 1],
                    this._measurePoints[i]
                );

                popup = this._measurePoints[i].getPopup();
                popup.setContent(this._formatDistance(this._distance));
            }
        }

        this._measurePath.setLatLngs(measurePointsLatLngs);
    },

    _resetPath: function () {
        this._layers.clearLayers();

        this._measurePoints = [];
        this._measurePath = undefined;
        this._distance = 0;
    },

    _updateTitle: function () {
        this._link.title = this.options.title[this._measuring];
    },

    _calcDistance: function (p1, p2) {
        return p1.getLatLng().distanceTo(p2.getLatLng());
    },

    _formatDistance: function (distance) {
        if (distance >= 100000) {
            return (distance / 1000).toFixed(0) + ' км';
        } else if (distance >= 1000) {
            return (distance / 1000).toFixed(1) + ' км';
        }

        return distance.toFixed(0) + ' м';
    }
});

require('./styles/Measure.css');

module.exports.Measure = Measure;

module.exports.measure = function (options) {
    return new Measure(options);
};
