const apiKey = '8538cce9a96d9f6139efbc5dad0c2ca0'; // Your API Key

document.getElementById('get-weather-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    if (city) {
        getCurrentWeatherData(city);
        getForecastData(city);
    } else {
        alert('Please enter a city name');
    }
});

async function getCurrentWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            displayWeatherData(data);
        } else {
            alert('City not found');
        }
    } catch (error) {
        alert('Error fetching weather data');
    }
}

async function getForecastData(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const forecastData = await response.json();

        if (forecastData.cod === "200") {
            displayForecastData(forecastData);
        } else {
            alert('Error fetching forecast data');
        }
    } catch (error) {
        alert('Error fetching 5-day forecast data');
    }
}

function displayWeatherData(data) {
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('temperature').textContent = `Temperature: ${data.main.temp} °C`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById('weather-description').textContent = data.weather[0].description;
    document.getElementById('weather-icon').src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
}

function displayForecastData(forecastData) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; // Clear previous forecast data

    const dailyForecasts = {}; // Store daily forecasts

    forecastData.list.forEach(entry => {
        const date = new Date(entry.dt_txt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const time = new Date(entry.dt_txt).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

        if (!dailyForecasts[date]) {
            dailyForecasts[date] = [];
        }

        dailyForecasts[date].push({
            time: time,
            temp: entry.main.temp,
            weather: entry.weather[0].description,
            icon: entry.weather[0].icon
        });
    });

    for (let date in dailyForecasts) {
        const dayCard = document.createElement('div');
        dayCard.classList.add('day-card');
        dayCard.innerHTML = `<h3>${date}</h3>`;

        dailyForecasts[date].forEach(entry => {
            const forecastEntry = document.createElement('div');
            forecastEntry.classList.add('forecast-entry');
            forecastEntry.innerHTML = `
                <p>${entry.time}: ${entry.temp} °C, ${entry.weather}</p>
                <img src="http://openweathermap.org/img/w/${entry.icon}.png" alt="Weather Icon">
            `;
            dayCard.appendChild(forecastEntry);
        });

        forecastContainer.appendChild(dayCard);
    }
}
