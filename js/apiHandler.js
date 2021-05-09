const apiUrl = "http://localhost:3000/weather";

async function checkResponse(response) {
    if (response.status >= 200 && response.status < 300) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response;
        } else {
            let error = new Error('Invalid response from the server.');
            throw error
        }
    } else {
        let json = await response.json();
        let error = new Error(json.message);
        throw error
    }
}

async function getWeatherJsonByCityNameAsync(cityName) {
    const response = await fetch(`${apiUrl}/city`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: String(cityName) })
    });
    await checkResponse(response);
    return response.json();
}

async function getWeatherJsonByCoordinatesAsync(lat, lon) {
    const response = await fetch(`${apiUrl}/coordinates?longitude=${lon}&latitude=${lat}`);
    await checkResponse(response);
    return response.json();
}

async function getAllWeatherForecastsJsonAsync() {
    const response = await fetch(`${apiUrl}/all`);
    await checkResponse(response);
    return response.json();
}

async function getDefaultWeatherJsonAsync() {
    const response = await fetch(apiUrl);
    await checkResponse(response);
    return response.json();
}

async function deleteWeatherAsync(cityId) {
    const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: String(cityId) })
    });
    if (response.status >= 200 && response.status < 300) {
        return;
    } else {
        const json = await response.json();
        throw new Error(json.message);
    }
}