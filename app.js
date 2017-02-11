// This is a fix for rainyday not having a way to stop it completely
RainyDay.prototype.destroy = function() {
    this.pause();
    this.canvas.parentNode.removeChild(this.canvas);
}

var DARKSKY_API_URL = 'https://api.darksky.net/forecast/';
var DARKSKY_API_KEY = 'fe7bfa5dd2a889de4ebca2d2368c5627';
var CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

var GOOGLE_MAPS_API_KEY = 'AIzaSyDwVmeI9OLy7BlG0EdnPFowoe_MKpmXJYA';
var GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// This function returns a promise that will resolve with an object of lat/lng coordinates
function getCoordinatesForCity(cityName) {
    // This is an ES6 template string, much better than verbose string concatenation...
    var url = `${GOOGLE_MAPS_API_URL}?address=${cityName}&key=${GOOGLE_MAPS_API_KEY}`;
    return (
        fetch(url) // Returns a promise for a Response
        .then(
            response => response.json()) // Returns a promise for the parsed JSON

        .then(data => data.results[0].geometry.location) // Transform the response to only take what we need
    );
}

function getCurrentWeather(coords) {
    // Template string again! I hope you can see how nicer this is :)
    var url = `${CORS_PROXY}${DARKSKY_API_URL}${DARKSKY_API_KEY}/${coords.lat},${coords.lng}?units=si&exclude=minutely,hourly,daily,alerts,flags`;
    return (
        fetch(url)
        .then(response => response.json())
        .then(data => data.currently)
    );
}

var app = document.querySelector('#app');
var cityForm = app.querySelector('.city-form');
var cityInput = cityForm.querySelector('.city-input');
var cityWeather = app.querySelector('.city-weather');
cityForm.addEventListener('submit', function(event) { // this line changes
    event.preventDefault(); // prevent the form from submitting

    // This code doesn't change!
    var city = cityInput.value;

    getCoordinatesForCity(city)
        .then(getCurrentWeather)
        .then(function(weather) {

            while (cityWeather.firstChild) {
                cityWeather.removeChild(cityWeather.firstChild);
            }

            var temperatureNode = document.createElement('div');
            temperatureNode.innerText = weather.temperature + "°";
            var timeNode = document.createElement('div');
            timeNode.innerText = new Date(weather.time * 1000);

            cityWeather.appendChild(temperatureNode);
            cityWeather.appendChild(timeNode);

            if (parseFloat(weather.humidity) > 0.8) {
                run();
            } else {
                var image = document.getElementById('background');
                // context.clearRect(0, 0, canvas.width, canvas.height);
                if (parseInt(weather.temperature) < 20) {
                    image.src = "Winter.jpg";
                } else {
                    image.src = "Sunny.jpg";
                }
                engine.destroy();

            }
        });

});
var engine;
var IsEngineRunning = false;

var run = function() {
    if (!IsEngineRunning) {
        IsEngineRunning = true;
        var image = document.getElementById('background');
        image.onload = function() {
            image.onload = null;
            engine = new RainyDay({
                image: this
            });
            engine.rain([
                [3, 3, 0.88],
                [5, 5, 0.9],
                [6, 2, 1]
            ], 100);
        };
        image.crossOrigin = 'anonymous';
        image.src = 'background.jpg';
    }
};
