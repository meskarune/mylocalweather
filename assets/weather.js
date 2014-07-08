$(function geolocation (){
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
    //if ( window.navigator.language != "en-US" ) {
    //    do stuff
    //}
	//else {
	//    do stuff
	//}
    var CurrentWeatherURL = "http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+long+"&units=imperial";
    var DailyForecastURL = "http://api.openweathermap.org/data/2.5/forecast/daily?lat="+lat+"&lon="+long+"&units=imperial&cnt=1";
    getWeather(CurrentWeatherURL, DailyForecastURL);
}
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            $("#weather").html("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            $("#weather").html("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            $("#weather").html("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            $("#weather").html("An unknown error occurred.");
            break;
    }
}
var data_timestamp=Math.round(new Date().getTime() / 1000);
function getWeather(data_url, forecast_url) {
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
            displayData();
        },
        error: function (errorData) {
            $("#forecast").html("Error retrieving forecast data :: "+ errorData.status);
        }
    });
    localStorage.timestamp = data_timestamp;
};
function displayData() {
    try {
        // If the timestamp is newer  than 30 minutes, parse data from cache
        if ( localStorage.getItem('timestamp') > data_timestamp - 1800){
            var data = JSON.parse(localStorage.WeatherCache);
            var forecast = JSON.parse(localStorage.ForecastCache);

            document.body.style.background = "url('assets/backgrounds/" +data.weather[0].icon+ ".jpg') no-repeat fixed 50% 50%";
            document.body.style.backgroundSize = "cover";

            $("#weather").html('<h2>' + data.name + '</h2><img class="icon" src="assets/icons/'+data.weather[0].icon+'.png"><span id="temp">'+ data.main.temp + ' </span><span id="units">&deg;F</span><p id="description">'+ data.weather[0].description + '</p><p><span id="humidity">'+ data.main.humidity + '% humidity</span>&nbsp;&nbsp;&nbsp;&nbsp;'+Math.round(data.wind.speed)+ 'mph wind</p>');
            $("#forecast").html('<p id="daily">Today\'s Forecast: '+forecast.list[0].weather[0].main+'</p><p>max: '+Math.round(forecast.list[0].temp.max)+'&deg; &nbsp;&nbsp;&nbsp;&nbsp;min: ' +Math.round(forecast.list[0].temp.min)+'&deg;</p>');
        }
        else {
            geolocation ();
        }
    }
    catch(error){
        window.console && console.error(error);
    }
}
