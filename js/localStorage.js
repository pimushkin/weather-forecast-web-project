function initLocalStorage() {
    const cities = getCitiesFromLocalStorage();
    if (!cities) {
        const defaultCities = [{ query: 'Moscow', id: 524901 }, { query: 'Helsinki', id: 658225 }]
        updateCitiesAtLocalStorage(defaultCities);
    }
}

function getCitiesFromLocalStorage() {
    return JSON.parse(localStorage.getItem("cities"));
}

function getCityIdsFromLocalStorage() {
    const cities = getCitiesFromLocalStorage();
    const ids = [...new Set(cities.map(city => city.id))];
    return ids;
}

function updateCitiesAtLocalStorage(cities) {
    localStorage.setItem("cities", JSON.stringify(cities));
}

function removeCitiesByIdFromLocalStorage(cityId) {
    const cities = getCitiesFromLocalStorage();
    if (cities) {
        const indexes = cities.reduce((arr, e, i) => ((e.id == cityId) && arr.push(i), arr), [])
        while (indexes.length) {
            cities.splice(indexes.pop(), 1);
        }
        updateCitiesAtLocalStorage(cities);
    }
}

function addCityToLocaleStorageArray(cityName, cityId) {
    var existingCities = getCitiesFromLocalStorage();
    const city = { query: cityName, id: cityId };
    if (existingCities == null) existingCities = [];

    if (existingCities.filter(function(e) {
            return e.query === cityName && e.id === cityId;
        }).length > 0) {
        let error = new Error('The city has already been added.');
        throw error;
    }

    if (existingCities.filter(function(e) {
            return e.query === cityName || e.id === cityId;
        }).length > 0) {
        existingCities.push(city);
        updateCitiesAtLocalStorage(existingCities);
        let error = new Error('The city has already been added.');
        throw error;
    }
    existingCities.push(city);
    updateCitiesAtLocalStorage(existingCities);
};

function isRequestRepeatedInLocalStorage(query) {
    const cities = getCitiesFromLocalStorage();
    if (cities) {
        if (cities.some(city => city.query == query)) {
            return true;
        }
    }
    return false;
}