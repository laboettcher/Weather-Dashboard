const APIKey = "c84e8851249f56ae68c460563f256b26";

var currentCity = "";
var lastCity = "";

// Error handler for fetch
var handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

// Get and display the current conditions for cities from Opean Weather API 
var getCurrentConditions = (event) => {
    let city = $('#search-city').val();
    currentCity= $('#search-city').val();
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + APIKey;

    fetch(queryURL)
    .then(handleErrors)
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        // Save cities to local storage
        saveCity(city);
        $('#search-error').text("");
        // Icons for current weather
        let currentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
        // Moment.js for different time zones
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
        // List cities
        renderCities();
        // Get 5 day forecast for cities
        getFiveDayForecast(event);
        // Current weather container content
        let currentWeatherHTML = `
            <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h3>
            <ul class="list-unstyled">
                <li>Temp: ${response.main.temp} &#8457;</li>
                <li>Wind: ${response.wind.speed} mph</li>
                <li>Humidity: ${response.main.humidity} %</li>
            </ul>`;
        $('#current-weather').html(currentWeatherHTML);
    })
}

// Display 5 day forecast for cities
var getFiveDayForecast = (event) => {
    let city = $('#search-city').val();
    // Forecast through API
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + APIKey;

    fetch(queryURL)
        .then (handleErrors)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
        let fiveDayForecastHTML = `
        <h2>5-Day Forecast:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
        // 5 day forecast for loop
        for (let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${thisMoment.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp} &#8457;</li>
                        <li>Wind: ${dayData.wind.speed} mph</li>
                        <li>Humidity: ${dayData.main.humidity} %</li>
                    </ul>
                </div>`;
            }
        }
        fiveDayForecastHTML += `</div>`;
        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
}

// Local storage content
var saveCity = (newCity) => {
    let cityExists = false;
    // Check for city in local storage
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

// List of cities
var renderCities = () => {
    $('#city-results').empty();
    if (localStorage.length===0){
        if (lastCity){
            $('#search-city').attr("value", lastCity);
        } else {
            $('#search-city').attr("value", "Austin");
        }
    } else {
        // Save previous searches
        let lastCityKey="cities"+(localStorage.length-1);
        lastCity=localStorage.getItem(lastCityKey);
        $('#search-city').attr("value", lastCity);
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;
            if (currentCity===""){
                currentCity=lastCity;
            }
            // Current city
            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            $('#city-results').prepend(cityEl);
        }
    }
    
}

// Search button event listener for new cities
$('#search-button').on("click", (event) => {
event.preventDefault();
currentCity = $('#search-city').val();
getCurrentConditions(event);
});

// Search button event listener for previous city searches
$('#city-results').on("click", (event) => {
    event.preventDefault();
    $('#search-city').val(event.target.textContent);
    currentCity=$('#search-city').val();
    getCurrentConditions(event);
});

renderCities();
getCurrentConditions();

