$( document ).ready(function() {

  var map, map_url, subDomains;

  map = L.map('map').setView([34.07, -118.30], 10);
  map_url = 'http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png';
  subDomains = ['otile1', 'otile2', 'otile3', 'otile4'];

  L.tileLayer(map_url, {
    attribution: "Map data &copy Open Street Map | Imagery &copy MQ",
    subdomains: subDomains
  }).addTo(map);

});
