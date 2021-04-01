const api = {
    key: "660e6272991aa4e57e4ede8f699f6ec3",
    baseUrl: "https://api.openweathermap.org/data/2.5/"
}

function Weather(json) {
    this.speed = json.wind.speed;
    this.cloudCover = json.weather[0].description;
    this.pressure = json.main.pressure;
    this.humidity = json.main.humidity;
    this.lon = json.coord.lon;
    this.lat = json.coord.lat;
    this.temperature = json.main.temp;
    this.iconUrl = json.weather[0]['icon'];
    this.cityName = json.name;
    this.id = json.id;
}

const searchBox = document.getElementById('searching');
searchBox.addEventListener('submit', setQuery);

async function setQuery(evt) {
    evt.preventDefault();
    try {
        const cityName = searchBox.querySelector('#city-input').value;
        if (isRequestRepeatedInLocalStorage(cityName)) {
            let error = new Error('The city has already been added.');
            throw error;
        }
        showLoader();
        const json = await getWeatherJsonByCityNameAsync(cityName);
        hideLoader();
        const weather = new Weather(json);
        addCityToLocaleStorageArray(cityName, weather.id);
        const completedCard = getCompletedCard(weather);
        loadCardToTopOfList(completedCard, weather.id);
    } catch (error) {
        window.alert(error);
    }
}

async function getWeatherJsonByCityNameAsync(query) {
    return await fetch(`${api.baseUrl}weather?q=${query}&units=metric&APPID=${api.key}`)
        .then((res) => {
            if (res.status >= 200 && res.status < 300) {
                return res;
            } else {
                let error = new Error('No data was found for this city.');
                throw error
            }
        })
        .then((res) => {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return res;
            } else {
                let error = new Error('Invalid response from the server.');
                throw error
            }
        })
        .then((res) => res.json());
}

async function getWeatherJsonByCityIdAsync(id) {
    return await fetch(`${api.baseUrl}weather?id=${id}&units=metric&APPID=${api.key}`)
        .then((res) => {
            if (res.status >= 200 && res.status < 300) {
                return res;
            } else {
                let error = new Error('No data was found for this city.');
                throw error
            }
        })
        .then((res) => {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return res;
            } else {
                let error = new Error('Invalid response from the server.');
                throw error
            }
        })
        .then((res) => {
            return res.json()
        });
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

    const iconUrl = `https://openweathermap.org/img/wn/${weather.iconUrl}.png`
    let icon = template.content.getElementById('icon');
    icon.setAttribute('src', iconUrl);

    let cityName = template.content.getElementById('city-name');
    cityName.innerText = weather.cityName;

    return template;
}

function loadCardToTopOfList(completedCard, cityId) {
    const listOfCities = document.getElementById('card-list');
    const cloneOfTemplate = completedCard.content.getElementById('card').cloneNode(true);

    listOfCities.insertBefore(cloneOfTemplate, listOfCities.firstChild);
    cloneOfTemplate.querySelector('#delete-button').onclick = () => {
        listOfCities.removeChild(cloneOfTemplate);
        removeCitiesByIdFromLocalStorage(cityId);
    };
}

function loadCitiesFromLocalStorage() {
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
            const weather = new Weather(city);
            const completedCard = getCompletedCard(weather);
            loadCardToTopOfList(completedCard, weather.id);
        });
        hideLoader();
    });
}

loadCitiesFromLocalStorage()