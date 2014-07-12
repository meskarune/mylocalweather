function SetScale(units) {
    $(".active").removeClass("active");
    $("#" +units).addClass("active");
    localStorage.Units = units;
}
$(function SetUnits () {
    var system = localStorage.getItem("Units");
    if (system != "metric" && system != "imperial") {
        system = window.navigator.language == "en-US" ? "imperial" : "metric";
    }
    $("#" +system).addClass("active");
    return system;
});
$(function geolocation () {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(getcoordinates,showError);
    }
    else {
        $("#weather").html("Geolocation is not supported by this browser.");
    }
});
function getcoordinates(position) {
    var lat=position.coords.latitude;
    var long=position.coords.longitude;
    var units=localStorage.getItem("Units");
    var CurrentWeatherURL = "http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+long+"&units="+units;
    var DailyForecastURL = "http://api.openweathermap.org/data/2.5/forecast/daily?lat="+lat+"&lon="+long+"&units="+units+"&cnt=1";
    if (units == "imperial") {
        getWeather(CurrentWeatherURL, DailyForecastURL, "F", "mph")
    }
    else {
        getWeather(CurrentWeatherURL, DailyForecastURL, "C", "m\/s")
    }
}
function showError(error) {
    var errorMessages = {
        PERMISSION_DENIED    : "User denied the request for geolocation.",
        POSITION_UNAVAILABLE : "Location information is unavailable.",
        TIMEOUT              : "The request to get user location timed out.",
        UNKNOWN_ERROR        : "An unknown error occurred."
    };
    $("#weather").html(errorMessages.UNKNOWN_ERROR);
    for (var msg in errorMessages)
        if (error[msg] === error.code)
            $("#weather").html(errorMessages[msg]);
}
var data_timestamp=Math.round(new Date().getTime() / 1000);
function getWeather(data_url, forecast_url, temp, wind) {
    $.ajax ({
        url: data_url,
        type: 'GET',
        cache: false,
        dataType: "jsonp",
        success: function(data) {
            localStorage.WeatherCache = JSON.stringify(data);
        },
        error: function (errorData) {
            $("#weather").html("Error retrieving current weather data :: "+ errorData.status);
        }
    });
    $.ajax ({
        url: forecast_url,
        type: 'GET',
        cache: false,
        datatype: "jsonp",
        success: function(data) {
            localStorage.ForecastCache = JSON.stringify(data);
            displayData(temp, wind);
        },
        error: function (errorData) {
            $("#forecast").html("Error retrieving forecast data :: "+ errorData.status);
        }
    });
    localStorage.timestamp = data_timestamp;
};
function displayData(temp_units, wind_units) {
    try {
        // If the timestamp is newer  than 30 minutes, parse data from cache
        if ( localStorage.getItem('timestamp') > data_timestamp - 1800){
            var data = JSON.parse(localStorage.WeatherCache);
            var forecast = JSON.parse(localStorage.ForecastCache);
            document.body.style.background = "url('assets/backgrounds/" +data.weather[0].icon+ ".jpg') no-repeat fixed 50% 50%";
            document.body.style.backgroundSize = "cover";
            $("#weather").html('<h2>' + data.name + '</h2><img class="icon" src="assets/icons/'+data.weather[0].icon+'.png"><span id="temp">'+ data.main.temp + ' </span><span id="units">&deg;'+temp_units+'</span><p id="description">'+ data.weather[0].description + '</p><p><span id="humidity">'+ data.main.humidity + '% humidity</span>&nbsp;&nbsp;&nbsp;&nbsp;'+ Math.round(data.wind.speed) + wind_units +' wind</p>');
            $("#forecast").html('<p id="daily">Today\'s Forecast: '+forecast.list[0].weather[0].main+'</p><p>max: '+Math.round(forecast.list[0].temp.max)+'&deg;'+temp_units+' &nbsp;&nbsp;&nbsp;&nbsp;min: ' +Math.round(forecast.list[0].temp.min)+'&deg;'+temp_units+'</p>');
        }
        else {
            geolocation ();
        }
    }
    catch(error){
        window.console && console.error(error);
    }
}
