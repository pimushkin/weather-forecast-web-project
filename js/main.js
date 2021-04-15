const api = {
    key: "660e6272991aa4e57e4ede8f699f6ec3",
    baseUrl: "https://api.openweathermap.org/data/2.5/"
}

class Weather {
    constructor(speed, cloudCover, pressure, humidity, lon, lat, temp, iconUrl, name, id) {
        this.speed = speed;
        this.cloudCover = cloudCover;
        this.pressure = pressure;
        this.humidity = humidity;
        this.lon = lon;
        this.lat = lat;
        this.temperature = temp;
        this.iconUrl = iconUrl;
        this.cityName = name;
        this.id = id;
    }
}

function checkResponse(response) {
    if (response.status >= 200 && response.status < 300) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response;
        } else {
            let error = new Error('Invalid response from the server.');
            throw error
        }
    } else {
        let error = new Error('No data was found for this city.');
        throw error
    }
}

async function getWeatherJsonByCityNameAsync(query) {
    const response = await fetch(`${api.baseUrl}weather?q=${query}&units=metric&APPID=${api.key}`);
    checkResponse(response);
    return response.json();
}

async function getWeatherJsonByCityIdAsync(id) {

    const response = await fetch(`${api.baseUrl}weather?id=${id}&units=metric&APPID=${api.key}`);
    checkResponse(response);
    return response.json();
}

async function getWeatherJsonByCoordinatesAsync(lat, lon) {

    const response = await fetch(`${api.baseUrl}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${api.key}`);
    checkResponse(response);
    return response.json();
}

function removeIDsFromTemplate(template) {
    template.removeAttribute('id');
    template.querySelector('#wind').removeAttribute('id');
    template.querySelector('#cloud-cover').removeAttribute('id');
    template.querySelector('#pressure').removeAttribute('id');
    template.querySelector('#humidity').removeAttribute('id');
    template.querySelector('#coordinates').removeAttribute('id');
    template.querySelector('#temp').removeAttribute('id');
    template.querySelector('#icon').removeAttribute('id');
    template.querySelector('#city-name').removeAttribute('id');
}

function getCompletedCard(weather) {
    const template = document.getElementById('card-template');

    let wind = template.content.getElementById('wind');
    wind.innerText = `${weather.speed} meter/sec`;

    let cloudCover = template.content.getElementById('cloud-cover');
    cloudCover.innerText = `${weather.cloudCover}`;

    let pressure = template.content.getElementById('pressure');
    pressure.innerText = `${weather.pressure} hPa`;

    let humidity = template.content.getElementById('humidity');
    humidity.innerText = `${weather.humidity} %`;

    let coordinates = template.content.getElementById('coordinates');
    coordinates.innerText = `[${weather.lon}, ${weather.lat}]`;

    let temperature = template.content.getElementById('temp');
    temperature.innerText = `${weather.temperature}°С`;

    const iconUrl = `https://openweathermap.org/img/wn/${weather.iconUrl}@2x.png`;
    let icon = template.content.getElementById('icon');
    icon.setAttribute('src', iconUrl);

    let cityName = template.content.getElementById('city-name');
    cityName.innerText = weather.cityName;

    return template;
}

function fillMainCity(weather) {
    const mainCity = document.getElementById('city-by-coordinates');

    let wind = mainCity.querySelector('#main-city-wind');
    wind.innerText = `${weather.speed} meter/sec`;

    let cloudCover = mainCity.querySelector('#main-city-cloud-cover');
    cloudCover.innerText = `${weather.cloudCover}`;

    let pressure = mainCity.querySelector('#main-city-pressure');
    pressure.innerText = `${weather.pressure} hPa`;

    let humidity = mainCity.querySelector('#main-city-humidity');
    humidity.innerText = `${weather.humidity} %`;

    let coordinates = mainCity.querySelector('#main-city-coordinates');
    coordinates.innerText = `[${weather.lon}, ${weather.lat}]`;

    let temperature = mainCity.querySelector('#main-city-temp');
    temperature.innerText = `${weather.temperature}°С`;

    const iconUrl = `https://openweathermap.org/img/wn/${weather.iconUrl}@2x.png`;
    let icon = mainCity.querySelector('#main-city-icon');
    icon.setAttribute('src', iconUrl);

    let cityName = mainCity.querySelector('#main-city-name');
    cityName.innerText = weather.cityName;
}

function loadCardToTopOfList(completedCard, cityId) {
    const listOfCities = document.getElementById('card-list');
    const cloneOfTemplate = completedCard.content.getElementById('card').cloneNode(true);
    removeIDsFromTemplate(cloneOfTemplate);
    listOfCities.insertBefore(cloneOfTemplate, listOfCities.firstChild);
    cloneOfTemplate.querySelector('#delete-button').onclick = () => {
        listOfCities.removeChild(cloneOfTemplate);
        removeCitiesByIdFromLocalStorage(cityId);
    };
    cloneOfTemplate.querySelector('#delete-button').removeAttribute('id');
}

function initLoad() {
    showLoader();
    initLocalStorage();
    const cityIds = getCityIdsFromLocalStorage();
    const promises = cityIds.map(id => new Promise(resolve => {
        const response = getWeatherJsonByCityIdAsync(id);
        resolve(response);
    }).catch(function() {
        removeCitiesByIdFromLocalStorage(id);
    }));

    Promise.all(promises).then(results => {

        results.forEach(city => {
            const weather = new Weather(city.wind.speed, city.weather[0].description,
                city.main.pressure, city.main.humidity, city.coord.lon, city.coord.lat,
                city.main.temp, city.weather[0]['icon'], city.name, city.id);
            const completedCard = getCompletedCard(weather);
            loadCardToTopOfList(completedCard, weather.id);
        });
    });
    if (navigator.geolocation) {
        try {
            navigator.geolocation.getCurrentPosition(async function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const promise = new Promise(resolve => {
                    const response = getWeatherJsonByCoordinatesAsync(lat, lon);
                    resolve(response);
                });
                promise.then(
                    function(value) {
                        const weather = new Weather(value.wind.speed, value.weather[0].description,
                            value.main.pressure, value.main.humidity, value.coord.lon, value.coord.lat,
                            value.main.temp, value.weather[0]['icon'], value.name, value.id);
                        fillMainCity(weather);
                        hideLoader();
                    },
                    function(error) {
                        window.alert(error)
                        hideLoader();
                    }
                );
            }, async function() {
                const promise = new Promise(resolve => {
                    const response = getWeatherJsonByCityIdAsync(2643743);
                    resolve(response);
                });
                promise.then(
                    function(value) {
                        const weather = new Weather(value.wind.speed, value.weather[0].description,
                            value.main.pressure, value.main.humidity, value.coord.lon, value.coord.lat,
                            value.main.temp, value.weather[0]['icon'], value.name, value.id);
                        fillMainCity(weather);
                        hideLoader();
                    },
                    function(error) {
                        window.alert(error);
                        hideLoader();
                    }
                );
            });
        } catch (error) {
            window.alert(error);
            hideLoader();
        }
    }
}

async function setQuery(evt) {
    evt.preventDefault();
    showLoader();
    try {
        const cityName = searchBox.querySelector('#city-input').value;
        if (isRequestRepeatedInLocalStorage(cityName)) {
            let error = new Error('The city has already been added.');
            throw error;
        }
        const city = await getWeatherJsonByCityNameAsync(cityName);
        const weather = new Weather(city.wind.speed, city.weather[0].description,
            city.main.pressure, city.main.humidity, city.coord.lon, city.coord.lat,
            city.main.temp, city.weather[0]['icon'], city.name, city.id);
        addCityToLocaleStorageArray(cityName, weather.id);
        const completedCard = getCompletedCard(weather);
        loadCardToTopOfList(completedCard, weather.id);
        hideLoader();
    } catch (error) {
        window.alert(error);
        hideLoader();
    }
}

async function setGeolocation(evt) {
    evt.preventDefault();
    if (navigator.geolocation) {
        showLoader();
        try {
            navigator.geolocation.getCurrentPosition(async function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const city = await getWeatherJsonByCoordinatesAsync(lat, lon);
                const weather = new Weather(city.wind.speed, city.weather[0].description,
                    city.main.pressure, city.main.humidity, city.coord.lon, city.coord.lat,
                    city.main.temp, city.weather[0]['icon'], city.name, city.id);
                fillMainCity(weather);
                hideLoader();
            }, async function() {
                const city = await getWeatherJsonByCityIdAsync(2643743);
                const weather = new Weather(city.wind.speed, city.weather[0].description,
                    city.main.pressure, city.main.humidity, city.coord.lon, city.coord.lat,
                    city.main.temp, city.weather[0]['icon'], city.name, city.id);
                fillMainCity(weather);
                hideLoader();
            });

        } catch (error) {
            window.alert(error);
            hideLoader();
        }
    }
}

const searchBox = document.getElementById('searching');
searchBox.addEventListener('submit', setQuery);

const refreshButton = document.getElementById('geolocation-button');
refreshButton.addEventListener('click', setGeolocation);

initLoad();