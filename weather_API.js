const apiKey = "25299348501487f7089515e8f776d4fd"; // This is my openweather API key
// This function will fetch weather data for a given city and display it in a table format
document.getElementById("checkWeatherBtn").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("City not found");
            return response.json();
        })
        .then(data => {
            const tableHTML = `
                <table>
                    <tr>
                        <th>City</th>
                        <th>Temperature (°C)</th>
                        <th>Condition</th>
                        <th>Wind Speed (m/s)</th>
                    </tr>
                    <tr>
                        <td>${data.name}</td>
                        <td>${data.main.temp}</td>
                        <td>${data.weather[0].description}</td>
                        <td>${data.wind.speed}</td>
                    </tr>
                </table>
            `;
            document.getElementById("weatherResult").innerHTML = tableHTML;
        })
        .catch(err => {
            document.getElementById("weatherResult").innerHTML = `<p class="error">${err.message}</p>`;
        });
});