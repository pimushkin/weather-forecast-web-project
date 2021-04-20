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
    }).catch(function () {
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
        function fillMainCityByJson(value) {
            const weather = new Weather(value.wind.speed, value.weather[0].description,
                value.main.pressure, value.main.humidity, value.coord.lon, value.coord.lat,
                value.main.temp, value.weather[0]['icon'], value.name, value.id);
            fillMainCity(weather);
            hideLoader();
        };
        function throwError(error) {
            window.alert(error);
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
                    const response = getWeatherJsonByCityIdAsync(2643743);
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
            navigator.geolocation.getCurrentPosition(async function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const city = await getWeatherJsonByCoordinatesAsync(lat, lon);
                const weather = new Weather(city.wind.speed, city.weather[0].description,
                    city.main.pressure, city.main.humidity, city.coord.lon, city.coord.lat,
                    city.main.temp, city.weather[0]['icon'], city.name, city.id);
                fillMainCity(weather);
                hideLoader();
            }, async function () {
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