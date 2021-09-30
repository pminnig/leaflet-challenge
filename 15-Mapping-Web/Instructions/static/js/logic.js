// Store our API endpoint.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

// Perform a GET request
d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
  console.log(data)
});

// 
function createFeatures(earthquakeData) {

  // Create popups for each point
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p>
	<hr><p>Magnitude: ${feature.properties.mag}</p>`);
  }

  var earthquakes = L.geoJson(earthquakeData, {
    style: function(feature) {
	  var depth = feature.geometry.coordinates[2];
	  if (depth >= 50.0) {
		return { color: "red" }; 
	  } 
	  else if (depth >= 15.0) {
		return { color: "orange" };
	  } 
	  else {
		return { color: "yellow" };
	  }
	},
    pointToLayer: function(feature, latlng) {
        return new L.CircleMarker(latlng, {
        	radius: feature.properties.mag, 
        	fillOpacity: 0.85
        });
    },
    onEachFeature: function (feature, layer) {
		layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p>
		<hr><p>Magnitude: ${feature.properties.mag}</p>`);
    }
});

  // Plug our earthquake layer into the create map function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      0, 0
    ],
    zoom: 3,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  
  // Set up the legend.
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [10,15,50];
    var labels = [];


    var legendInfo = "<h1>Magnitude</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">mag < 10</div>" +
        "<div class=\"max\">mag > 50</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color:['yellow','orange','red']\"></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Add the legend
  legend.addTo(myMap);
}