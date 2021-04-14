const api = {
    key: "660e6272991aa4e57e4ede8f699f6ec3",
    baseUrl: "https://api.openweathermap.org/data/2.5/"
}

class Weather {
    constructor(json) {
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
}

const searchBox = document.getElementById('searching');
searchBox.addEventListener('submit', setQuery);

async function setQuery(evt) {
    evt.preventDefault();
    showLoader();
    try {
        const cityName = searchBox.querySelector('#city-input').value;
        if (isRequestRepeatedInLocalStorage(cityName)) {
            let error = new Error('The city has already been added.');
            throw error;
        }
        const json = await getWeatherJsonByCityNameAsync(cityName);
        const weather = new Weather(json);
        addCityToLocaleStorageArray(cityName, weather.id);
        const completedCard = getCompletedCard(weather);
        loadCardToTopOfList(completedCard, weather.id);
    } catch (error) {
        window.alert(error);
    }
    hideLoader();
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