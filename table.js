const apiKey = "8538cce9a96d9f6139efbc5dad0c2ca0";
const weatherTableBody = document.querySelector("#weather-table tbody");

let weatherDataGlobal = []; // Store weather data globally for unit conversion and sorting
let currentUnit = 'C';  // Default to Celsius

async function fetchWeatherData(lat, lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch weather data");
    }

    return response.json();
}

async function getCityCoordinates(city) {
    const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );

    if (!geoResponse.ok) {
        throw new Error("City not found");
    }

    const geoData = await geoResponse.json();

    if (!geoData.length) {
        throw new Error("City not found");
    }

    const { lat, lon } = geoData[0];
    return { lat, lon };
}

function renderWeatherData(weatherData) {
    weatherTableBody.innerHTML = ""; // Clear the table

    const forecastList = weatherData.list.filter((item) => item.dt_txt.includes("12:00:00"));

    if (forecastList.length === 0) {
        weatherTableBody.innerHTML = `<tr><td colspan="4">No midday forecast data available.</td></tr>`;
        return;
    }

    forecastList.forEach((entry) => {
        const row = document.createElement("tr");

        const date = new Date(entry.dt_txt).toLocaleDateString();
        const temp = `${Math.round(entry.main.temp)} °${currentUnit}`;
        const condition = entry.weather[0].description;
        const city = weatherData.city.name;

        const dateCell = document.createElement("td");
        dateCell.textContent = date;
        row.appendChild(dateCell);

        const cityCell = document.createElement("td");
        cityCell.textContent = city;
        row.appendChild(cityCell);

        const tempCell = document.createElement("td");
        tempCell.textContent = temp;
        row.appendChild(tempCell);

        const conditionCell = document.createElement("td");
        conditionCell.textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
        row.appendChild(conditionCell);

        weatherTableBody.appendChild(row);
    });
}

// Search functionality
document.getElementById("search-btn").addEventListener("click", async () => {
    const citySearchInput = document.getElementById("city-search").value.trim();

    if (!citySearchInput) {
        alert("Please enter a city name.");
        return;
    }

    try {
        showLoadingSpinner();
        const { lat, lon } = await getCityCoordinates(citySearchInput);
        const weatherData = await fetchWeatherData(lat, lon);
        weatherDataGlobal = weatherData;  // Store globally for future operations
        hideLoadingSpinner();
        renderWeatherData(weatherData);
    } catch (error) {
        hideLoadingSpinner();
        alert(error.message);
    }
});

document.getElementById("city-search").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        document.getElementById("search-btn").click();
    }
});

function convertTemperature(temp, unit) {
    return unit === 'F' ? (temp * 9 / 5) + 32 : temp;
}

document.getElementById('toggle-units').addEventListener('click', () => {
    if (!weatherDataGlobal.list) {
        alert("No data available to convert.");
        return;
    }

    const isCelsius = currentUnit === 'C';
    currentUnit = isCelsius ? 'F' : 'C';

    const forecastList = weatherDataGlobal.list.filter((item) => item.dt_txt.includes("12:00:00"));

    const rows = weatherTableBody.querySelectorAll("tr");
    forecastList.forEach((entry, index) => {
        if (index >= rows.length) return;
        const tempCell = rows[index].children[2];
        const tempValue = entry.main.temp;
        const convertedTemp = Math.round(convertTemperature(tempValue, currentUnit));
        tempCell.textContent = `${convertedTemp} °${currentUnit}`;
    });

    document.getElementById('toggle-units').textContent = `Show in ${isCelsius ? 'Fahrenheit' : 'Celsius'}`;
});

// Sorting
document.getElementById('sort-asc').addEventListener('click', () => {
    if (!weatherDataGlobal.list) {
        alert("No data available to sort.");
        return;
    }

    const sortedList = [...weatherDataGlobal.list].filter(item => item.dt_txt.includes("12:00:00")).sort((a, b) => a.main.temp - b.main.temp);
    renderWeatherData({ ...weatherDataGlobal, list: sortedList });
});

document.getElementById('sort-desc').addEventListener('click', () => {
    if (!weatherDataGlobal.list) {
        alert("No data available to sort.");
        return;
    }

    const sortedList = [...weatherDataGlobal.list].filter(item => item.dt_txt.includes("12:00:00")).sort((a, b) => b.main.temp - a.main.temp);
    renderWeatherData({ ...weatherDataGlobal, list: sortedList });
});

// Filter for Rainy Days
document.getElementById('filter-rainy-days').addEventListener('click', () => {
    if (!weatherDataGlobal.list) {
        alert("No data available to filter.");
        return;
    }

    // Filter for entries where the weather condition includes 'rain'
    const rainyDays = weatherDataGlobal.list.filter(item =>
        item.weather.some(condition => condition.description.toLowerCase().includes('rain'))
    );

    if (rainyDays.length === 0) {
        weatherTableBody.innerHTML = `<tr><td colspan="4">No rainy days in the forecast.</td></tr>`;
    } else {
        renderWeatherData({ ...weatherDataGlobal, list: rainyDays });
    }
});

// Find and Display the Hottest Day
document.getElementById('hottest-day').addEventListener('click', () => {
    if (!weatherDataGlobal.list) {
        alert("No data available to filter.");
        return;
    }

    // Use reduce() to find the entry with the highest temperature
    const hottestDay = weatherDataGlobal.list.reduce((max, item) => {
        return item.main.temp > max.main.temp ? item : max;
    }, weatherDataGlobal.list[0]);

    renderWeatherData({ ...weatherDataGlobal, list: [hottestDay] });  // Render the hottest day
});

function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
            showLoadingSpinner();
            const weatherData = await fetchWeatherData(lat, lon);
            weatherDataGlobal = weatherData; // Store globally for unit conversion
            hideLoadingSpinner();
            renderWeatherData(weatherData);
        } catch (error) {
            hideLoadingSpinner();
            console.error('Geolocation Error:', error.message);
        }
    }, () => {
        console.error('Geolocation not available or permission denied.');
    });
} else {
    console.error('Geolocation not supported by this browser.');
}
