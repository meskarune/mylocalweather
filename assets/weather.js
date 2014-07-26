function SetUnits(units) {
    localStorage.Units = units;
    $(".active").removeClass("active");
    $("#" +units).addClass("active");
}
$(function() {
    $("#imperial, #metric").on("click", function() {
        SetUnits(this.id);
        handleCache();
    });
    DefaultUnits ();
});
function DefaultUnits () {
    var system = localStorage.getItem("Units");
    if (system != "metric" && system != "imperial") {
        system = window.navigator.language == "en-US" ? "imperial" : "metric";
    }
    SetUnits(system);
}
function geolocation () {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(getcoordinates,showError);
    }
    else {
        $("#weather").html("Geolocation is not supported by this browser.");
    }
}
function getcoordinates(position) {
    var lat=position.coords.latitude;
    var long=position.coords.longitude;
    getWeather("weather", lat, long);
    getWeather("forecast/daily", lat, long);
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
function getWeather(type, lat, long) {
    var units=localStorage.getItem("Units");
    $.ajax ({
        url: "http://api.openweathermap.org/data/2.5/" + type + "?lat=" + lat + "&lon=" + long + "&units=" + units,
        type: 'GET',
        cache: false,
        dataType: "text",
        success: function(data) {
            localStorage.setItem("cache-" + type + "-" + units, data);
            handleCache();
        },
        error: function (errorData) {
            $("#weather").html("Error retrieving current weather data :: "+ errorData.status);
        }
    });
};
function handleCache() {
    var data_timestamp=Math.round(Date.now() / 1000);
    if (localStorage.getItem("timestamp") && localStorage.getItem("timestamp") <= data_timestamp - 1800) {
        localize();
    }
    else {
        geolocation(function() {
            localStorage.timestamp = data_timestamp;
            localize();
        });
    }
}
function localize() {
    if (localStorage.getItem("Units") == "imperial") {
        displayData("imperial", "F", "mph");
    }
    else {
        displayData("metric", "C", "m\/s");
    }
}
function displayData(system, temp_units, wind_units) {
    var data, forecast;
    try {
        data = JSON.parse(localStorage.getItem("cache-weather-"+ system));
        forecast = JSON.parse(localStorage.getItem("cache-forecast\/daily-"+ system));
    } 
    catch (exception) {
        if (window.console) {
            console.error(exception);
        }
        return;
    }
    document.body.style.background = "url('assets/backgrounds/" +data.weather[0].icon+ ".jpg') no-repeat fixed 50% 50%";
    document.body.style.backgroundSize = "cover";
    $("#weather").html('<h2>' + data.name + '</h2><img class="icon" src="assets/icons/'+data.weather[0].icon+'.png"><span id="temp">'+ data.main.temp + ' </span><span id="units">&deg;'+temp_units+'</span><p id="description">'+ data.weather[0].description + '</p><p><span id="humidity">'+ data.main.humidity + '% humidity</span>&nbsp;&nbsp;&nbsp;&nbsp;'+ Math.round(data.wind.speed) + wind_units +' wind</p>');
    $("#forecast").html('<p id="daily">Today\'s Forecast: '+forecast.list[0].weather[0].main+'</p><p>max: '+Math.round(forecast.list[0].temp.max)+'&deg;'+temp_units+' &nbsp;&nbsp;&nbsp;&nbsp;min: ' +Math.round(forecast.list[0].temp.min)+'&deg;'+temp_units+'</p>');
}
