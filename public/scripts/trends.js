
/* get link for the geojson file */
const trendsGeoJson = "https://raw.githubusercontent.com/moinabyssinia/gssr/gh-pages/metadata/trends/allTrends_v4.geojson"

// adding layer definition
const mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWljaGFlbGd0YWRlc3NlIiwiYSI6ImNrcGI5ZnBwNjA0OHYydnIzcTk0N3c0em0ifQ.jbKBBNxF3jk2KFDQ1GSq3A';

const streets   = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', attribution: mbAttr, tileSize: 512, zoomOffset: -1}),
      dark  = L.tileLayer(mbUrl, {id: 'mapbox/dark-v10', attribution: mbAttr})



const map = L.map('mapid', {
    center: [15, 0],
    zoom: 2.0,
    layers: [dark] // one of the layers needs to be default
});


// add the new control to the map
// L.Control.zoomHome().addTo(map);

const baseLayers = {
    "Streets": streets,
    "Dark": dark
    
};

L.control.layers(baseLayers).addTo(map);

const icon = new L.Icon({
    iconUrl: '../icons/trends-circle.png',
    iconSize: [10, 10]
  });
  

/* adding zoom home button */
// custom zoom bar control that includes a Zoom Home function
L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topright',
        zoomInText: '+',
        zoomInTitle: 'Zoom in',
        zoomOutText: '-',
        zoomOutTitle: 'Zoom out',
        zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
        zoomHomeTitle: 'Zoom home'
    },

    onAdd: function (map) {
        var controlName = 'gin-control-zoom',
            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
            options = this.options;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
        controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
        controlName + '-home', container, this._zoomHome);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
        controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function (map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function (e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function (e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function (e) {
        map.setView([15, 0], 2);
    },

    _createButton: function (html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function () {
        var map = this._map,
            className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});
// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(map);




/* fetching data from geojson file */  

fetch(trendsGeoJson)
    .then(
        res => res.json()
    )
    .then(
        data => L.geoJSON(data, {
            pointToLayer: function(feature, latlng){
                const marker = L.marker(latlng, {icon: icon})
                
                // define popup text
                let popupText = 
                "<table>" +
                    "<tr bgcolor = '#C5C5C5'>" +
                        "<td><strong>Tide Gauge</strong></td>" +
                        `<td><strong>${feature.properties.tg}</strong></td>` +
                    "</tr>" +

                    // G-E20C 1930 trends
                    "<tr>" +
                        "<td>G-E20C [1930-2010]</td>" +
                        `<td>${feature.properties.e99_1930_sigf === "TRUE" ? 
                                Number(feature.properties.e99_1930).toFixed(3)+' mm/yr*'
                                : feature.properties.e99_1930 === null ?
                                    "NaN"
                                    : Number(feature.properties.e99_1930).toFixed(3)+' mm/yr'}</td>` +
                    "</tr>" +

                    // G-E20C 1950 trends
                    "<tr>" +
                        "<td>G-E20C [1950-2010]</td>" +
                        `<td>${feature.properties.e99_1950_sigf === "TRUE" ? 
                            Number(feature.properties.e99_1950).toFixed(3)+' mm/yr*' 
                                : feature.properties.e99_1950 === null ?
                                    "NaN"
                                    : Number(feature.properties.e99_1950).toFixed(3)+' mm/yr'}</td>` +
                    "</tr>" +

                    // G-20CR 1930 trends
                    "<tr>" +
                        "<td>G-20CR [1930-2015]</td>" +
                        `<td>${feature.properties.t99_1930_sigf === "TRUE" ? 
                            Number(feature.properties.t99_1930).toFixed(3)+' mm/yr*' 
                                : feature.properties.t99_1930 === null ?
                                    "NaN" 
                                    : Number(feature.properties.t99_1930).toFixed(3)+' mm/yr'}</td>` +
                    "</tr>" +

                    // G-20CR 1950 trends
                    "<tr>" +
                        "<td>G-20CR [1950-2015]</td>" +
                        `<td>${feature.properties.t99_1950_sigf === "TRUE" ? 
                            Number(feature.properties.t99_1950).toFixed(3)+' mm/yr*' 
                                : feature.properties.t99_1950 === null ?
                                    "NaN"
                                    : Number(feature.properties.t99_1950).toFixed(3)+' mm/yr'}</td>` +
                    "</tr>" +

                "</table>" + 
               
                "<p style = 'color : blue; margin = 0;'>" +
                    '<em>* significant trends at 5% level</em>'+
                "</p>"

                // add popup 
                marker.bindPopup(popupText, {maxWidth: 500})

                return marker;
            }
        }).addTo(map)
    )