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