// URL to earthquake json data (all earthquakes happened in the last 7 days)
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";


// GET request, and function to handle returned JSON data
d3.json(queryUrl, function(data) {   
    createEarthquakes(data.features);
});

// Create two layerGroups
var earthquakes = L.layerGroup();
var tectonicplates = L.layerGroup();

// Define tile layers
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});

var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_KEY
});



// function "createEarthquakes" to pull, arrange, use the data.
function createEarthquakes(earthquakeData) {

  var earthquakeMarkers = [];
      for (var i = 0; i < earthquakeData.length; i++) {

      var magnitude = earthquakeData[i].properties.mag
      var lat = earthquakeData[i].geometry.coordinates[1]
      var lng = earthquakeData[i].geometry.coordinates[0]
      var latlng = [lat,lng]
      var depth = earthquakeData[i].geometry.coordinates[2]

      var color = "";
        if (depth < 10){color = "DarkOrange"}
        else if (depth < 30) {color = "Tomato"}
        else if (depth < 50) {color = "DarkSalmon"}
        else if (depth < 70) {color = "Blue"}
        else if (depth < 90) {color = "Red"}
        else {color = "DarkRed"}

      earthquakeMarkers.push(
        L.circle(latlng, {
          stroke: false,
          fillOpacity: .8,
          color: "white",
          fillColor: color,
          radius: magnitude*30000
        }).bindPopup("<h3>" + earthquakeData[i].properties.title +
        "</h3><hr><p>" + new Date(earthquakeData[i].properties.time) + "</p>")
    )
  }




  var earthquakes = L.layerGroup(earthquakeMarkers)

    // Earthquakes layer to the createMap function
  createMap(earthquakes);

}


// function to define maping layers (street map and dark map)
function createMap(earthquakes) {

    var streetsmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
      });
    
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/dark-v10",
      accessToken: API_KEY
    });
    
    // to define the base map object to hold layer (satellite map as base layer)
    var baseMaps = {
        "Streets Map": streetsmap,
        "Dark Map": darkmap
    };
    
    // to define the overlay object 
    var overlayMaps = {
        "Earthquakes": earthquakes
    };

    // to create map with the create layers.

    var myMap = L.map("map", {
    center: [38.2700, -100.8603], // center of the US.
    zoom: 4,
    layers: [streetsmap, earthquakes]
    });

    // to create layer control and added to myMap
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);
    
      function legendColor(depth){
        if (depth < 10){return "DarkOrange"}
        else if (depth < 30) {return "Tomato"}
        else if (depth < 50) {return "DarkSalmon"}
        else if (depth < 70) {return "Blue"}
        else if (depth < 90) {return "Red"}
        else {return "DarkRed"}
    }  

  // Create a GeoJSON layer containing the features array
  // Each feature a popup describing the place and time of the earthquake
  L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, 
        // Set the style of the markers based on properties.mag
        {
          radius: markerSize(feature.properties.mag),
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          fillOpacity: 0.7,
          color: "black",
          stroke: true,
          weight: 0.5
        }
      );
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><hr><p>Date: "
      + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
  }).addTo(earthquakes);
  // Sending our earthquakes layer to the createMap function
  earthquakes.addTo(myMap);

  // Get the tectonic plate data from tectonicplatesURL
  d3.json(tectonicplatesURL, function(data) {
    L.geoJSON(data, {
      color: "orange",
      weight: 2
    }).addTo(tectonicplates);
    tectonicplates.addTo(myMap);
  });


    // to create legend in myMap 

    var legend = L.control({
        position: "bottomleft",
        fillColor: "White"
    });

    // to create legend and added to myMap
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");
        var depth = [9, 29, 49, 69, 89, 500];
        var labels = ["<10", "10-30", "30-50", "50-70", "70-90", "90+"];
        div.innerHTML = '<div>Depth (km)</div>';
        for (var i = 0; i < depth.length; i++){
          div.innerHTML += '<i style="background:' + legendColor(depth[i]) + '">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;'+
                          labels[i] + '<br>';
        }
        return div;
    };
      
    legend.addTo(myMap);
}