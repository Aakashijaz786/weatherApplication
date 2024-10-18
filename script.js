const apiKey = '8538cce9a96d9f6139efbc5dad0c2ca0'; // Your API Key

document.getElementById('get-weather-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    if (city) {
        getCurrentWeatherData(city);
        get5DayForecast(city); // Fetch 5-day forecast for the charts
    } else {
        alert('Please enter a city name');
    }
});

// Function to fetch current weather data
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

// Function to display current weather data and change background
function displayWeatherData(data) {
    // Display the weather data
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('temperature').textContent = `Temperature: ${data.main.temp} °C`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById('weather-description').textContent = data.weather[0].description;
    document.getElementById('weather-icon').src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;

    // Get the weather condition (main) from the data
    const weatherCondition = data.weather[0].main.toLowerCase();
    console.log('Current weather condition:', weatherCondition); // Debug log

    // Select the weather data card
    const weatherCard = document.getElementById('weather-data');

    // Remove any previous weather-related background classes
    weatherCard.classList.remove('clear-weather', 'cloudy-weather', 'rainy-weather', 'default-weather');

    // Apply background based on the weather condition
    if (weatherCondition.includes('clear')) {
        weatherCard.classList.add('clear-weather'); // Clear sky background
    } else if (weatherCondition.includes('clouds')) {
        weatherCard.classList.add('cloudy-weather'); // Cloudy background
    } else if (weatherCondition.includes('rain')) {
        weatherCard.classList.add('rainy-weather'); // Rainy background
    } else {
        weatherCard.classList.add('default-weather'); // Default background
    }
}

document.getElementById('show-hottest-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    if (city) {
        get5DayForecast(city); // Fetch 5-day forecast for the hottest day
    } else {
        alert('Please enter a city name');
    }
});

document.getElementById('show-rain-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    if (city) {
        get5DayForecast(city, true); // Fetch 5-day forecast only for rain
    } else {
        alert('Please enter a city name');
    }
});

// Function to fetch 5-day weather forecast data
async function get5DayForecast(city, onlyRain = false) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === '200') {
            const forecastData = processForecastData(data, onlyRain);
            createCharts(forecastData);
        } else {
            alert('City not found');
        }
    } catch (error) {
        alert('Error fetching 5-day forecast');
    }
}

// Function to process 5-day forecast data and return necessary data for charts
function processForecastData(data, onlyRain = false) {
    const forecast = data.list;
    const labels = [];
    const temperatures = [];
    const weatherConditionsCount = {
        sunny: 0,
        cloudy: 0,
        rainy: 0
    };

    let hottestDay = { temperature: -Infinity, date: '' }; // Track hottest day

    // OpenWeather returns forecast data in 3-hour intervals, we'll aggregate for each day
    for (let i = 0; i < forecast.length; i += 8) {
        const dayForecast = forecast[i]; // Take data for each day at the same time
        const dayTemperature = dayForecast.main.temp;
        labels.push(new Date(dayForecast.dt_txt).toLocaleDateString());
        temperatures.push(dayTemperature); // Temperature data

        const condition = dayForecast.weather[0].main.toLowerCase();
        if (condition.includes('clear')) {
            weatherConditionsCount.sunny++;
        } else if (condition.includes('clouds')) {
            weatherConditionsCount.cloudy++;
        } else if (condition.includes('rain')) {
            weatherConditionsCount.rainy++;
        }

        // Track the hottest day
        if (dayTemperature > hottestDay.temperature) {
            hottestDay = { temperature: dayTemperature, date: labels[labels.length - 1] };
        }
    }

    // If onlyRain is true, filter the data to only include rainy days
    if (onlyRain) {
        return {
            labels: labels.filter((_, index) => temperatures[index] < 100 && forecast[index].weather[0].main.toLowerCase().includes('rain')),
            temperatures: temperatures.filter((temp, index) => forecast[index].weather[0].main.toLowerCase().includes('rain')),
            weatherConditionsCount
        };
    } else {
        alert(`The hottest day is ${hottestDay.date} with a temperature of ${hottestDay.temperature} °C`);
        return { labels, temperatures, weatherConditionsCount };
    }
}

// Function to create the charts dynamically based on forecast data
function createCharts(forecastData) {
    const { labels, temperatures, weatherConditionsCount } = forecastData;

    // 1. Vertical Bar Chart - Temperatures for the next 5 days
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            animation: {
                delay: 500 // Delay animation for bar chart
            }
        }
    });

    // 2. Doughnut Chart - Weather conditions percentage
    const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
    new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: ['Sunny', 'Cloudy', 'Rainy'],
            datasets: [{
                label: 'Weather Conditions',
                data: [
                    weatherConditionsCount.sunny,
                    weatherConditionsCount.cloudy,
                    weatherConditionsCount.rainy
                ],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.6)', // Sunny
                    'rgba(54, 162, 235, 0.6)', // Cloudy
                    'rgba(255, 99, 132, 0.6)'  // Rainy
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            animation: {
                delay: 500 // Delay animation for doughnut chart
            }
        }
    });

    // 3. Line Chart - Temperature changes over 5 days
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature Changes (°C)',
                data: temperatures,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.3
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            animation: {
                easing: 'easeOutBounce', // Drop animation for line chart
                duration: 2000
            }
        }
    });
}

// Get elements for hamburger menu functionality
const hamburgerMenu = document.querySelector('.hamburger');
const sideNavbar = document.querySelector('.sidebar');
const closeMenu = document.querySelector('.close-menu');

// Add event listener for hamburger menu click
hamburgerMenu.addEventListener('click', () => {
    sideNavbar.classList.toggle('active'); // Toggle the sidebar active class
});

// Add event listener for close button
closeMenu.addEventListener('click', () => {
    sideNavbar.classList.remove('active'); // Remove active class when close button is clicked
});
