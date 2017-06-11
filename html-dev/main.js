var cyclemap = L.tileLayer('tiles/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
});

var cyclemap_local = L.tileLayer('localtiles/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
});

var bw_mapnik = L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
});

var mapnik = L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
});
        

var Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
        });


var baseMaps = {
  "MyCycleMap Live": cyclemap,
  "MyCycleMap": cyclemap_local,
  "mapnik": mapnik,
  "bw_mapnik": bw_mapnik,
  "Positron": Positron,
};

var map = L.map('mapid', {
    center: [54, -2],
    zoom: 4,
    layers: [cyclemap]
    }
  );

  // FeatureGroup is to store editable layers
drawnItems = L.featureGroup().addTo(map);
  
L.control.layers(baseMaps, {'drawlayer':drawnItems}).addTo(map);
var hash = new L.Hash(map);


var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems,
    },
    draw: {
        polygon: false,
//        marker: false,
        rectangle: false,
        circle: false,
        polyline: {
          showLength: true,
          feet: false,
          shapeOptions: {
            color: 'red'
          }
        },
    }
});
map.addControl(drawControl);  

L.control.scale({
    imperial: false
}).addTo(map);                


/*
new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.OpenStreetMap()
    }).addTo(map);
*/        

// Truncate value based on number of decimals
var _round = function(num, len) {
    return Math.round(num*(Math.pow(10, len)))/(Math.pow(10, len));
};                

// Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
var strLatLng = function(latlng) {
    return "("+_round(latlng.lat, 4)+", "+_round(latlng.lng, 4)+")";
};

// Generate popup content based on layer type
// - Returns HTML string, or null if unknown object
var getPopupContent = function(layer) {
    // Marker - add lat/long
    if (layer instanceof L.Marker) {
        return strLatLng(layer.getLatLng());
    // Circle - lat/long, radius
    } else if (layer instanceof L.Circle) {
        var center = layer.getLatLng(),
            radius = layer.getRadius();
        return "Center: "+strLatLng(center)+"<br />"
              +"Radius: "+(radius>10000)?(radius/1000).toFixed(0)+' km':(radius).toFixed(0)+' m';
    // Rectangle/Polygon - area
    } else if (layer instanceof L.Polygon) {
        var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
            area = L.GeometryUtil.geodesicArea(latlngs);
        return "Area: "+L.GeometryUtil.readableArea(area, true);
    // Polyline - distance
    } else if (layer instanceof L.Polyline) {
        var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
            distance = 0;
        if (latlngs.length < 2) {
            return "Distance: N/A";
        } else {
            for (var i = 0; i < latlngs.length-1; i++) {
                distance += latlngs[i].distanceTo(latlngs[i+1]);
            }
            return "Distance: "+(distance>10000)?(distance/1000).toFixed(0)+' km':(distance).toFixed(0)+' m';
        }
    }
    return null;
};                

map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    var content = getPopupContent(layer);
    if (content !== null) {
        layer.bindPopup(content);
    }
    drawnItems.addLayer(layer);
});            

// Object(s) edited - update popups
map.on(L.Draw.Event.EDITED, function(event) {
    var layers = event.layers,
        content = null;
    layers.eachLayer(function(layer) {
        content = getPopupContent(layer);
        if (content !== null) {
            layer.setPopupContent(content);
        }
    });
});               


// download button
L.easyButton( '<span class="star">&starf;</span>', function(){
  gpxData = togpx(drawnItems.toGeoJSON())

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(gpxData));
  element.setAttribute('download', 'route.gpx');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);                  
  
}).addTo(map);                


// download button
L.easyButton( '<span class="star">&equiv;</span>', function(){
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(drawnItems.toGeoJSON())));
  element.setAttribute('download', 'route.geojson');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);                  
  
}).addTo(map);                



// drag'n'drop feature

var dropZone = document.getElementById('mapid')
// Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
dropZone.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});                


// Get file data on drop
dropZone.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files; // Array of all files

    for (var i=0, file; file=files[i]; i++) {
//                      console.log(escape(file.name)+', ' + file.size+' Bytes ');
        if (file.name.match(/\.gpx/i)) {
            var reader = new FileReader();
            reader.onload = function(e2) {
                //console.log(e2.target.result)
                var dom = (new DOMParser()).parseFromString(e2.target.result, 'text/xml')
                var geojson = toGeoJSON.gpx(dom)
                var newlayer = L.geoJson(geojson).getLayers()[0]   // see https://github.com/Leaflet/Leaflet.draw/issues/187
                newlayer.setStyle({
                  color: 'red',
                  opacity: 0.5,
                  weight: 4,
                })

                var content = getPopupContent(newlayer);
                if (content !== null) {
                    newlayer.bindPopup(content);
                }
                
                drawnItems.addLayer(newlayer)
                //map.fitBounds(drawnItems.getBounds())
            }
            reader.readAsText(file); // start reading the file data.
        }

        else if (file.name.match(/\.geojson/i)) {
            var reader = new FileReader();
            reader.onload = function(e2) {
//                console.log(e2.target.result)
                var newlayer = L.geoJson(JSON.parse(e2.target.result)).getLayers()   // see https://github.com/Leaflet/Leaflet.draw/issues/187
                
                for (var i = 0; i < newlayer.length; i++) {
                  layeritem = newlayer[i]
/*                  
                  layeritem.setStyle({
                    color: 'red',
                    opacity: 0.5,
                    weight: 4,
                  })
*/
                  var content = getPopupContent(layeritem);
                  if (content !== null) {
                      layeritem.bindPopup(content);
                  }
                  drawnItems.addLayer(layeritem)
                }
            }
            reader.readAsText(file); // start reading the file data.
        }
      
      
    }
});                



              