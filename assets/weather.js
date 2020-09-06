var weather = document.getElementById("weather");
var forcast = document.getElementById("forecast");

function setunits(unit) {
  localStorage.setItem("Units", unit);
}

function getunits() {
  var system = localStorage.getItem("Units");
  if (system != "metric" && system != "imperial") {
    system = window.navigator.language == "en-US" ? "imperial" : "metric";
    setunits(system);
  }
  return localStorage.getItem("Units");
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}

function getUrlParam(parameter, defaultvalue){
  var urlparameter = defaultvalue;
  if(window.location.href.indexOf(parameter) > -1){
    urlparameter = getUrlVars()[parameter];
  }
  return urlparameter;
}

var keyid = getUrlParam('key','empty');

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getcoordinates,showError); }
  else {
    x.innerHTML = "Geolocation is not supported by this browser."; }
}

      function getcoordinates(position) {
        getweather(position.coords.latitude, position.coords.longitude)
      }

function showError(error) {
  var errorMessages = {
    PERMISSION_DENIED    : "User denied the request for geolocation.",
    POSITION_UNAVAILABLE : "Location information is unavailable.",
    TIMEOUT              : "The request to get user location timed out.",
    UNKNOWN_ERROR        : "An unknown error occurred."
  };
  weather.innerHTML = errorMessages.UNKNOWN_ERROR
  for (var msg in errorMessages)
    if (error[msg] === error.code)
      weather.innerHTML = errorMessages[msg]
}

      var getJSON = function(url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'json';
        request.onload = function() {
          var code = request.status
          if (code >= 200 && code < 400) {
            callback(request.response);
          }
          else {
            callback(null);
            console.log(code)
          }
        };
        request.send();
      };

function localize (units) {
  if (units == "imperial") {
    displayweather(units, "F", "mph")
  }
  else {
    displayweather(units, "C", "km\/h")
  }
}

function handleCache() {
  var data_timestamp=Math.round(Date.now() / 1000);
  var unitsystem = getunits();
  if (localStorage.getItem("timestamp") && localStorage.getItem("timestamp") <= data_timestamp - 1800) {
    localize(unitsystem);
  }
  else {
    localStorage.timestamp = data_timestamp;
    getLocation();
  }
}

function displayweather(unitsystem, temp_unit, wind_unit) {
  var data;
  try {
    data = JSON.parse(localStorage.getItem("weather-" + unitsystem));
  }
  catch (exception) {
    if (window.console) {
      console.error(exception);
    }
    return;
  }
  let DomBody = document.querySelector('#content');
  DomBody.style.background = "url('assets/backgrounds/" + data.current.weather[0].icon + ".jpg') no-repeat fixed 50% 50%";
  DomBody.style.backgroundSize = "cover";
  weather.innerHTML = '<h2>Current Weather</h2><img class="icon" src="assets/icons/' + data.current.weather[0].icon + '.png"><span id="temp">' + Math.round(data.current.temp) + '&deg;' + temp_unit + '</span><p id="description">' + data.current.weather[0].description + '</p><p><span id="humidity">' + data.current.humidity + '% humidity</span>&nbsp;&nbsp;&nbsp;&nbsp;' + Math.round(data.current.wind_speed) + wind_unit + ' wind</p>'
  forcast.innerHTML = '<p id="daily">Today\'s Forecast: ' + data.daily[0].weather[0].main + '</p><p>max: ' + Math.round(data.daily[0].temp.max)  + '&deg;' + temp_unit + ' &nbsp;&nbsp;&nbsp;&nbsp;min: ' + Math.round(data.daily[0].temp.min) + '&deg;' + temp_unit + '</p>'
}

function getweather(LAT, LON) {
  var unitsystem = getunits();
  var APIurl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + LAT + '&lon=' + LON + '&exclude=minutely,hourly&units=' + unitsystem + '&APPID=' + keyid
  console.log(APIurl)
  getJSON(APIurl, function(data) {
    if (data == null) {
      if (keyid == "empty"){
        forcast.innerHTML = 'You need to add an API key to the url. `example.com?key=&lt;api&gt;`' }
      else {
        forcast.innerHTML = 'There was a problem with the request' }
    }
    else {
      localStorage.setItem("weather-" + unitsystem, JSON.stringify(data));
      localize(unitsystem);
    }
  });
}

window.onload=handleCache();
