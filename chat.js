const GEMINI_API_KEY = 'AIzaSyCF6GyJNeIe2uROGC4irTDUUUWe-sADVVQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Function to send a message to the Gemini API
async function sendMessageToGemini(message) {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: message
                        }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get response from Gemini API');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Function to handle chat messages
async function handleChatMessage(message) {
    if (message.toLowerCase().includes('weather')) {
        // Handle weather-related queries
        try {
            const weatherData = await fetchCurrentWeather(currentCity);
            return `The current weather in ${weatherData.name} is ${weatherData.weather[0].description} with a temperature of ${weatherData.main.temp.toFixed(1)}${units === 'metric' ? '°C' : '°F'}.`;
        } catch (error) {
            return "I'm sorry, I couldn't fetch the weather information at the moment.";
        }
    } else {
        // Use Gemini API for non-weather queries
        try {
            return await sendMessageToGemini(message);
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return "I'm sorry, I encountered an error while processing your request.";
        }
    }
}

// Function to add a message to the chat interface
function addMessageToChat(message, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `p-2 mb-2 rounded ${isUser ? 'bg-blue-100 text-right' : 'bg-gray-100'}`;
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listener for the chat input
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessageToChat(message, true);
            chatInput.value = '';
            const response = await handleChatMessage(message);
            addMessageToChat(response);
        }
    }

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendButton.addEventListener('click', sendMessage);
});
