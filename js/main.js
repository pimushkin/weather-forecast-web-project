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

function loadCardToTopOfList(completedCard, cityId) {
    const listOfCities = document.getElementById('card-list');
    const cloneOfTemplate = completedCard.content.getElementById('card').cloneNode(true);
    removeIDsFromTemplate(cloneOfTemplate);
    listOfCities.insertBefore(cloneOfTemplate, listOfCities.firstChild);
    cloneOfTemplate.querySelector('#delete-button').onclick = async () => {
        showLoader();
        try {
            await deleteWeatherAsync(cityId);
            listOfCities.removeChild(cloneOfTemplate);
        } catch (error) {
            window.alert(error);
        }
        finally {
            hideLoader();
        }
    };
    cloneOfTemplate.querySelector('#delete-button').removeAttribute('id');
}

async function initLoad() {
    showLoader();
    const promise = new Promise(resolve => {
        const response = getAllWeatherForecastsJsonAsync();
        resolve(response);
    });
    function throwError(error) {
        window.alert(error);
        hideLoader();
    };
    promise.then(value => {
        value.weatherConditions.forEach(city => {
            const weather = new Weather(city.wind.speed, city.weather[0].description,
                city.main.pressure, city.main.humidity, city.coord.lon, city.coord.lat,
                city.main.temp, city.weather[0]['icon'], city.name, city.id);
            const completedCard = getCompletedCard(weather);
            loadCardToTopOfList(completedCard, weather.id);
        });
    }, error => throwError(error));
    if (navigator.geolocation) {
        function fillMainCityByJson(value) {
            const weather = new Weather(value.wind.speed, value.weather[0].description,
                value.main.pressure, value.main.humidity, value.coord.lon, value.coord.lat,
                value.main.temp, value.weather[0]['icon'], value.name, value.id);
            fillMainCity(weather);
            hideLoader();
        };
        try {
            navigator.geolocation.getCurrentPosition(async function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const promise = new Promise(resolve => {
                    const response = getWeatherJsonByCoordinatesAsync(lat, lon);
                    resolve(response);
                });
                promise.then(value => fillMainCityByJson(value), error => throwError(error));
            }, async function () {
                const promise = new Promise(resolve => {
                    const response = getDefaultWeatherJsonAsync();
                    resolve(response);
                });
                promise.then(value => fillMainCityByJson(value), error => throwError(error));
            });
        } catch (error) {
            throwError(error);
        }
    }
}

async function setQuery(evt) {
    evt.preventDefault();
    showLoader();
    try {
        const cityName = searchBox.querySelector('#city-input').value;
        const city = await getWeatherJsonByCityNameAsync(cityName);
        const weather = new Weather(city.wind.speed, city.weather[0].description,
            city.main.pressure, city.main.humidity, city.coord.lon, city.coord.lat,
            city.main.temp, city.weather[0]['icon'], city.name, city.id);
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
            navigator.geolocation.getCurrentPosition(async function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const city = await getWeatherJsonByCoordinatesAsync(lat, lon);
                const weather = new Weather(city.wind.speed, city.weather[0].description,
                    city.main.pressure, city.main.humidity, city.coord.lon, city.coord.lat,
                    city.main.temp, city.weather[0]['icon'], city.name, city.id);
                fillMainCity(weather);
            }, async function () {
                const city = await getDefaultWeatherJsonAsync();
                const weather = new Weather(city.wind.speed, city.weather[0].description,
                    city.main.pressure, city.main.humidity, city.coord.lon, city.coord.lat,
                    city.main.temp, city.weather[0]['icon'], city.name, city.id);
                fillMainCity(weather);
            });

        } catch (error) {
            window.alert(error);
        }
        finally {
            hideLoader();
        }
    }
}

const searchBox = document.getElementById('searching');
searchBox.addEventListener('submit', setQuery);

const refreshButton = document.getElementById('geolocation-button');
refreshButton.addEventListener('click', setGeolocation);

initLoad();