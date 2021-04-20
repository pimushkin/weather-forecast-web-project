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

function getWeatherToInsert(weather) {
    let weatherToInsert = {
        speed: `${weather.speed} meter/sec`,
        cloudCover: `${weather.cloudCover}`,
        pressure: `${weather.pressure} hPa`,
        humidity: `${weather.humidity} %`,
        coordinates: `[${weather.lon}, ${weather.lat}]`,
        temperature: `${weather.temperature}°С`,
        iconUrl: `https://openweathermap.org/img/wn/${weather.iconUrl}@2x.png`,
        cityName: weather.cityName
    };
    return weatherToInsert;
}

function getCompletedCard(weather) {
    const weatherToInsert = getWeatherToInsert(weather);
    const template = document.getElementById('card-template');
    template.content.getElementById('wind').innerText = weatherToInsert.speed;
    template.content.getElementById('cloud-cover').innerText = weatherToInsert.cloudCover;
    template.content.getElementById('pressure').innerText = weatherToInsert.pressure;
    template.content.getElementById('humidity').innerText = weatherToInsert.humidity;
    template.content.getElementById('coordinates').innerText = weatherToInsert.coordinates;
    template.content.getElementById('temp').innerText = weatherToInsert.temperature;
    template.content.getElementById('icon').setAttribute('src', weatherToInsert.iconUrl);
    template.content.getElementById('city-name').innerText = weatherToInsert.cityName;
    return template;
}

function fillMainCity(weather) {
    const weatherToInsert = getWeatherToInsert(weather);
    const mainCity = document.getElementById('city-by-coordinates');
    mainCity.querySelector('#main-city-wind').innerText = weatherToInsert.speed;
    mainCity.querySelector('#main-city-cloud-cover').innerText = weatherToInsert.cloudCover;
    mainCity.querySelector('#main-city-pressure').innerText = weatherToInsert.pressure;
    mainCity.querySelector('#main-city-humidity').innerText = weatherToInsert.humidity;
    mainCity.querySelector('#main-city-coordinates').innerText = weatherToInsert.coordinates;
    mainCity.querySelector('#main-city-temp').innerText = weatherToInsert.temperature;
    mainCity.querySelector('#main-city-icon').setAttribute('src', weatherToInsert.iconUrl);
    mainCity.querySelector('#main-city-name').innerText = weatherToInsert.cityName;
}