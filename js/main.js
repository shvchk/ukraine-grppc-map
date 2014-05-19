var regionsDataUri = "data/regionsData.json";
var regionsCoordinatesUri = "data/regionsCoordinates.topojson";
var initialCoordinates = [48.47, 31.39];
var intialScale = 6;

var regionsData = {};
var regionsCoordinates = {};

loadJSON(regionsDataUri, function(s) {
  regionsData = JSON.parse(s);
  dataLoad();
});

loadJSON(regionsCoordinatesUri, function(s) {
  regionsCoordinates = JSON.parse(s);
  regionsCoordinates = topojson.feature(regionsCoordinates, regionsCoordinates.objects.regionsCoordinates);
  dataLoad();
});

function dataLoad() {
  if (Object.keys(regionsData).length !== 0
    && Object.keys(regionsCoordinates).length !== 0) {

    var grp = [];
    for (var region in regionsData) {
      grp.push(regionsData[region].grp);
    }

    grp.sort(function (a, b) { return a - b });

    var grpMin = grp[0];
    var grpMax = grp[grp.length - 1];
    var grpMedian = median(grp);

    function style(feature) {
      var regionId = feature.properties.iso_3166_2;
      var region = regionsData[regionId];
      var fillOpacity = region.grp / grpMax;

      return {
        color: '#fff',
        opacity: 1,
        weight: 1,
        fillColor: '#000',
        fillOpacity: fillOpacity
      };
    }

    var geojson;

    function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
        weight: 2,
        color: '#ff4'
      });

      if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
      }

      info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
      geojson.resetStyle(e.target);
      info.update();
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
      });
    }

    var map = L.map('map').setView(initialCoordinates, intialScale);
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
      id: 'shevchuk.i8eh460b',
    }).addTo(map);

    geojson = L.geoJson(regionsCoordinates, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

    var info = L.control({ position: 'bottomleft' });

    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
      var text = '<div class="info-region">';

      if (props) {
        var regionData = regionsData[props.iso_3166_2];

        text += '<div class="region-name">' + regionData.name + '<br />' + regionData.name_ru + '</div>';
        text += '<div class="region-grp">' + regionData.grp + ' UAH</div>';
      } else {
        text += 'Hover over a region<br />Укажите регион';
      }

      text += '</div>';
      text += '<div class="info-header">';
      text += '<h4>Ukraine GRP per capita distribution (2012)</h4>';
      text += '<h4>Распределение украинского ВРП на душу (2012)</h4>';
      text += '</div>';
      this._div.innerHTML = text;
    };

    info.addTo(map);
  }
}

function loadJSON(uri, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', uri, true);
  xobj.send(null);

  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4) { //  && xobj.status == "200"
      callback(xobj.responseText);
    }
  };
}

function median(arr) {
  if (arr.length == 0) {
    return null
  }

  arr.sort(function (a, b) { return a - b });
  var mid = Math.floor(arr.length / 2);

  if ((arr.length % 2) == 1) { // length is odd
    return arr[mid];
  } else {
    return (arr[mid - 1] + arr[mid]) / 2;
  }
}