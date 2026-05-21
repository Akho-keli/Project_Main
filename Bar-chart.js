    
    /* =========================
       APARTMENTS
    ========================== */

    const apartments = [

        {
            id: 101,
            rooms: [
                { room: 1, pressure: 60, temp: 30 }
               /*, { room: 2, pressure: 70, temp: 35 },
                { room: 3, pressure: 50, temp: 28 },
                { room: 4, pressure: 65, temp: 40 }*/
            ]
        }

      /* , {
            id: 102,
            rooms: [
                { room: 1, pressure: 72, temp: 45 },
                { room: 2, pressure: 68, temp: 38 },
                { room: 3, pressure: 55, temp: 32 },
                { room: 4, pressure: 60, temp: 36 }
            ]
        },

        {
            id: 103,
            rooms: [
                { room: 1, pressure: 55, temp: 31 },
                { room: 2, pressure: 66, temp: 42 },
                { room: 3, pressure: 71, temp: 44 },
                { room: 4, pressure: 58, temp: 36 }
            ]
        },

        {
            id: 104,
            rooms: [
                { room: 1, pressure: 80, temp: 60 },
                { room: 2, pressure: 75, temp: 50 },
                { room: 3, pressure: 68, temp: 45 },
                { room: 4, pressure: 70, temp: 48 }
            ]
        }*/

    ];
     function calculateRisk(pressure, temp) {

        return (pressure * 0.6) + (temp * 0.4);

    }
document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       ELEMENTS
    ========================== */

    const dashboard = document.getElementById("dashboard");
    const outsideTemp = document.getElementById("outsideTemp");
    const weather = document.getElementById("weather");
    const modeIndicator = document.getElementById("modeIndicator");

    // KPI ELEMENTS
    const avgTempDisplay = document.getElementById("avgTemp");
    const alertsDisplay = document.getElementById("alerts");
    const healthDisplay = document.getElementById("health");

    // SYSTEM ELEMENTS
    const kitchenCylinder =
    document.getElementById("kitchen-cylinder");

    const bathroomCylinder =
    document.getElementById("bathroom-cylinder");

    const valve =
    document.getElementById("valve");


    /* =========================
       WEATHER API
    ========================== */

    const API_KEY = "af92777221c1474959c0f0dbc813c5db";
    const city = "Johannesburg";


    /* =========================
       DATA STORAGE
    ========================== */

    let history = [];
    const historyMax = 50;

    let riskChart;
    let tempChart;

    let pies = {};





    /* =========================
       WEATHER
    ========================== */

    function getWeather() {

        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)

        .then(res => res.json())

        .then(data => {

            outsideTemp.textContent =
            data.main?.temp?.toFixed(1) || "--";

            weather.textContent =
            data.weather?.[0]?.description || "Unavailable";

        })

        .catch(() => {

            outsideTemp.textContent = "--";
            weather.textContent = "Unavailable";

        });

    }


    /* =========================
       RISK CALCULATION
    ========================== */

   


    /* =========================
       ROOM SIMULATION
    ========================== */

    function simulateRoom(room) {

        room.pressure += Math.random() * 10 - 5;
        room.temp += Math.random() * 6 - 3;

        room.pressure =
        Math.max(0, Math.min(110, room.pressure));

        room.temp =
        Math.max(20, Math.min(100, room.temp));

    }


    /* =========================
       LOG SYSTEM
    ========================== */

    function addLog(message) {

        const logs =
        document.getElementById("logs");

        const li =
        document.createElement("li");

        li.textContent =
        `${new Date().toLocaleTimeString()} - ${message}`;

        logs.prepend(li);

        if(logs.children.length > 8){

            logs.removeChild(logs.lastChild);

        }

    }


    /* =========================
       UPDATE DASHBOARD
    ========================== */

    function updateSystem() {

        dashboard.innerHTML = "";

        let allRooms = [];

        let activeAlerts = 0;


        apartments.forEach(apartment => {

            let html = `
            <div class="apartment-card">

                <h3>
                    Apartment ${apartment.id}
                </h3>

                <div class="rooms">
            `;


            apartment.rooms.forEach(room => {

                simulateRoom(room);

                let status = "Normal";
                let cls = "normal";

                if(room.pressure > 95 || room.temp > 85){

                    status = "Emergency";
                    cls = "emergency";

                    activeAlerts++;

                    addLog(
                        `Emergency detected in Apartment ${apartment.id}, Room ${room.room}`
                    );

                }

                else if(room.pressure > 85 || room.temp > 70){

                    status = "Critical";
                    cls = "critical";

                    activeAlerts++;

                }

                else if(room.pressure > 65){

                    status = "Warning";
                    cls = "warning";

                }


                html += `
                <div class="room">

                    <h4>
                        Room ${room.room}
                    </h4>

                    <p>
                        🌡 Temp:
                        ${room.temp.toFixed(1)}°C
                    </p>

                    <p>
                        📈 Pressure:
                        ${room.pressure.toFixed(1)}%
                    </p>

                    <span class="status ${cls}">
                        ${status}
                    </span>

                </div>
                `;


                allRooms.push(room);

                history.push(room.temp);

                if(history.length > historyMax){

                    history.shift();

                }

            });


            html += `
                </div>
            </div>
            `;

            dashboard.innerHTML += html;

        });


        /* =========================
           AVERAGE TEMPERATURE
        ========================== */

        const avgTemperature =

        allRooms.reduce(
            (sum, room) => sum + room.temp,
            0
        )

        / allRooms.length;


        avgTempDisplay.textContent =
        avgTemperature.toFixed(1) + "°C";


        /* =========================
           ACTIVE ALERTS
        ========================== */

        alertsDisplay.textContent =
        activeAlerts;


        /* =========================
           SYSTEM HEALTH
        ========================== */

        const health =
        Math.max(
            0,
            100 - (activeAlerts * 10)
        );

        healthDisplay.textContent =
        health + "%";


        /* =========================
           BUILDING STATUS
        ========================== */

        const avgRisk =

        allRooms.reduce(
            (sum, room) =>
            sum + calculateRisk(room.pressure, room.temp),
            0
        )

        / allRooms.length;


        let buildingStatus = "SAFE";

        modeIndicator.className =
        "mode-indicator";


        if(avgRisk > 85){

            buildingStatus = "DANGER";

            modeIndicator.classList.add("danger");

        }

        else if(avgRisk > 70){

            buildingStatus = "HIGH RISK";

            modeIndicator.classList.add("warning");

        }

        else{

            modeIndicator.classList.add("safe");

        }


        modeIndicator.textContent =
        `BUILDING STATUS: ${buildingStatus}`;


        /* =========================
           CYLINDER + VALVE STATUS
        ========================== */
//// FOR TESTING THE CYINDERS ******************* ///////////////////
        const dangerousRooms =
        allRooms.filter(
            room =>
            room.temp > 60 ||
            room.pressure > 70
        );

        const criticalRooms =
        allRooms.filter(
            room =>
            room.temp > 75 ||
            room.pressure > 90
        );


        // KITCHEN CYLINDER

        if(criticalRooms.length > 0){

            kitchenCylinder.textContent =
            "Leak Detected";

            kitchenCylinder.style.color =
            "#ef4444";

        }

        else if(dangerousRooms.length > 0){

            kitchenCylinder.textContent =
            "Warning";

            kitchenCylinder.style.color =
            "#facc15";

        }

        else{

            kitchenCylinder.textContent =
            "Normal";

            kitchenCylinder.style.color =
            "#4ade80";

        }


        // BATHROOM CYLINDER

        if(criticalRooms.length >= 2){

            bathroomCylinder.textContent =
            "Critical";

            bathroomCylinder.style.color =
            "#ef4444";

        }

        else if(dangerousRooms.length > 0){

            bathroomCylinder.textContent =
            "Moderate";

            bathroomCylinder.style.color =
            "#facc15";

        }

        else{

            bathroomCylinder.textContent =
            "Normal";

            bathroomCylinder.style.color =
            "#4ade80";

        }


        // VALVE

        if(criticalRooms.length > 0){

            valve.textContent =
            "Closed";

            valve.style.color =
            "#ef4444";

        }

        else{

            valve.textContent =
            "Open";

            valve.style.color =
            "#4ade80";

        }


        updateCharts();
        updatePieCharts();
         updateBuildingColors();

    }


    /* =========================
       CHARTS
    ========================== */

    function updateCharts() {

        const risks = apartments.map(apartment =>

            apartment.rooms.reduce(

                (sum, room) =>

                sum + calculateRisk(
                    room.pressure,
                    room.temp
                ),

                0

            )

            / apartment.rooms.length

        );


        /* BAR CHART */

/* BAR CHART */

if (!riskChart) {

    riskChart = new Chart(

        document.getElementById("riskChart"),

        {
            type: "bar",

            data: {
                labels: apartments.map(
                    a => `Apartment ${a.id}`
                ),

                datasets: [{
                    label: "Risk Score",

                    data: risks,

                    backgroundColor: risks.map(risk => {

                        if (risk >= 85) {
                            return "#ef4444"; // RED
                        }

                        else if (risk >= 70) {
                            return "#f59e0b"; // ORANGE
                        }

                        else if (risk >= 50) {
                            return "#eab308"; // YELLOW
                        }

                        else {
                            return "#22c55e"; // GREEN
                        }

                    }),

                    borderColor: risks.map(risk => {

                        if (risk >= 85) {
                            return "#dc2626";
                        }

                        else if (risk >= 70) {
                            return "#d97706";
                        }

                        else if (risk >= 50) {
                            return "#ca8a04";
                        }

                        else {
                            return "#16a34a";
                        }

                    }),

                    borderWidth: 2,

                    borderRadius: 10
                }]
            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        labels: {
                            color: "white"
                        }

                    }

                },

                scales: {

                    x: {

                        ticks: {
                            color: "white"
                        }

                    },

                    y: {

                        ticks: {
                            color: "white"
                        }

                    }

                }

            }

        }

    );

}

else {

    riskChart.data.labels =
        apartments.map(a => `Apartment ${a.id}`);

    riskChart.data.datasets[0].data = risks;

    riskChart.data.datasets[0].backgroundColor = risks.map(risk => {

        if (risk >= 85) {
            return "#ef4444";
        }

        else if (risk >= 70) {
            return "#f59e0b";
        }

        else if (risk >= 50) {
            return "#eab308";
        }

        else {
            return "#22c55e";
        }

    });

    riskChart.data.datasets[0].borderColor = risks.map(risk => {

        if (risk >= 85) {
            return "#dc2626";
        }

        else if (risk >= 70) {
            return "#d97706";
        }

        else if (risk >= 50) {
            return "#ca8a04";
        }

        else {
            return "#16a34a";
        }

    });

    riskChart.update();

}


/* LINE CHART */

if (!tempChart) {

    tempChart = new Chart(

        document.getElementById("tempChart"),

        {

            type: "line",

            data: {

                labels: history.map((_, i) => i),

                datasets: [{

                    label: "Temperature History",

                    data: history,

                    borderColor: "#38bdf8",

                    backgroundColor: "rgba(56,189,248,0.1)",

                    fill: true,

                    tension: 0.4

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        labels: {
                            color: "white"
                        }

                    }

                },

                scales: {

                    x: {

                        ticks: {
                            color: "white"
                        }

                    },

                    y: {

                        ticks: {
                            color: "white"
                        }

                    }

                }

            }

        }

    );

}

else {

    tempChart.data.labels =
        history.map((_, i) => i);

    tempChart.data.datasets[0].data =
        history;

    tempChart.update();

}
    }


    /* =========================
       PIE CHARTS
    ========================== */

    function updatePieCharts() {

    const room = apartments[0].rooms[0];

    const risk =
    calculateRisk(room.pressure, room.temp);

    const safeValue =
    100 - risk;

    if(!pies["main"]){

        pies["main"] = new Chart(

            document.getElementById("pie101"),

            {

                type: "doughnut",

                data: {

                    labels: [
                        "Safe",
                        "Risk"
                    ],

                    datasets: [{

                        data: [
                            safeValue,
                            risk
                        ],

                        backgroundColor: [
                            "#22c55e",
                            "#ef4444"
                        ],

                        borderWidth: 0

                    }]

                },

                options: {

                    responsive: true,

                    cutout: "75%",

                    plugins: {

                        legend: {

                            labels: {

                                color: "white"

                            }

                        }

                    }

                }

            }

        );

    }

    else{

        pies["main"].data.datasets[0].data = [

            safeValue,
            risk

        ];

        pies["main"].update();

    }

}
// ================== MAP BUTTON + LEAFLET ==================

const mapBtn = document.getElementById("mapBtn");
const mapDiv = document.getElementById("map");

let mapInstance = null;
let incidentMarker = null;
let routeLine = null;

// ================== EMERGENCY CENTRES ==================
const emergencyCentres = [
    { name: "Johannesburg Fire Station", lat: -26.2045, lng: 28.0450 },
    { name: "EMS Central", lat: -26.1990, lng: 28.0600 },
    { name: "Police Station CBD", lat: -26.2020, lng: 28.0400 }
];

// ================== DISTANCE (km) ==================
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1*Math.PI/180) *
        Math.cos(lat2*Math.PI/180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// ================== FIND NEAREST CENTRE ==================
function getNearestCentre(lat, lng) {

    let nearest = null;
    let minDist = Infinity;

    emergencyCentres.forEach(c => {
        const d = getDistance(lat, lng, c.lat, c.lng);
        if (d < minDist) {
            minDist = d;
            nearest = c;
        }
    });

    return nearest;
}

// ================== DRAW FASTEST ROUTE (OSRM) ==================
async function drawRoute(start, end) {

    const url = `https://router.project-osrm.org/route/v1/driving/` +
        `${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes.length) return;

    const coords = data.routes[0].geometry.coordinates;

    const latlngs = coords.map(c => [c[1], c[0]]);

    // remove old route
    if (routeLine) {
        mapInstance.removeLayer(routeLine);
    }

    routeLine = L.polyline(latlngs, {
        color: "blue",
        weight: 4
    }).addTo(mapInstance);
}

// ================== MAP BUTTON ==================
mapBtn.onclick = function () {

    if (
    mapDiv.style.display === "none" || mapDiv.style.display === ""){
        mapDiv.style.display = "block";
        mapBtn.textContent = "❌ Close Map";

        if (!mapInstance) {

            mapInstance = L.map('map').setView([-26.2041, 28.0473], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: "© OpenStreetMap"
            }).addTo(mapInstance);

            setTimeout(() => mapInstance.invalidateSize(), 100);

            // ================== INCIDENT CLICK ==================
            mapInstance.on("click", async function (e) {

                const lat = e.latlng.lat;
                const lng = e.latlng.lng;

                if (incidentMarker) {
                    mapInstance.removeLayer(incidentMarker);
                }

                // ================== DEFAULT DATA ==================
                let displayName = "Unknown location";
                let building = "N/A";
                let suburb = "N/A";
                let city = "N/A";
                let postcode = "N/A";
                let ward = "N/A";

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                    );
                    const data = await res.json();

                    const addr = data.address || {};

                    displayName = data.display_name || "Unknown location";

                    building =
                        addr.building ||
                        addr.house_name ||
                        addr.residential ||
                        addr.amenity ||
                        "N/A";

                    suburb =
                        addr.suburb ||
                        addr.neighbourhood ||
                        addr.village ||
                        addr.town ||
                        "N/A";

                    city =
                        addr.city ||
                        addr.municipality ||
                        addr.county ||
                        "N/A";

                    postcode = addr.postcode || "N/A";

                    ward = addr.ward || addr.quarter || "N/A";

                } catch (err) {
                    console.log("Reverse geocode failed", err);
                }

                const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

                // ================== NEAREST EMERGENCY CENTRE ==================
                const nearest = getNearestCentre(lat, lng);

                const distanceKm = getDistance(lat, lng, nearest.lat, nearest.lng).toFixed(2);
                const etaMin = Math.round((distanceKm / 60) * 60);

                drawRoute(
                    { lat, lng },
                    { lat: nearest.lat, lng: nearest.lng }
                );

                // ================== MARKER ==================
                incidentMarker = L.marker([lat, lng])
                    .addTo(mapInstance)
                    .bindPopup(`
                        🚨 <b>Emergency Incident</b><br><br>

                        🏢 <b>Building:</b> ${building}<br>
                        📍 <b>Suburb:</b> ${suburb}<br>
                        🌆 <b>City:</b> ${city}<br>
                        📮 <b>Postal Code:</b> ${postcode}<br>
                        🗳️ <b>Ward:</b> ${ward}<br><br>

                        🚑 <b>Nearest Emergency Centre:</b><br>
                        ${nearest.name}<br><br>

                        📏 <b>Distance:</b> ${distanceKm} km<br>
                        ⏱️ <b>ETA:</b> ${etaMin} min<br><br>

                        📍📌 <b>Full Location:</b><br>
                        ${displayName}<br><br>

                         <a href="${googleMapsLink}" target="_blank">
                            Open in Google Maps
                        </a>
                    `)
                    .openPopup();
            });

            // ================== EMERGENCY CENTRES ==================
            emergencyCentres.forEach(c => {

                const circle = L.circle([c.lat, c.lng], {
                    color: "red",
                    fillColor: "#ff0000",
                    fillOpacity: 0.25,
                    radius: 800
                }).addTo(mapInstance);

                circle.bindTooltip(c.name);
            });
        }

    } else {
        mapDiv.style.display = "none";
        mapBtn.textContent = "🗺️ Open Emergency Map";
    }
};

    /* =========================
       START SYSTEM
    ========================== */

    updateSystem();

    setInterval(updateSystem, 3000);

    getWeather();
    
});


/// Layout mapffffffffffffffffffffffffffffffffffhhhh///
const building = document.getElementById("building");
const toggleBtn = document.getElementById("toggleBuildingBtn");

let buildingLoaded = false;

// TOGGLE BUILDING VIEW
toggleBtn.onclick = function () {

    if (building.style.display === "none" || building.style.display === "") {
        building.style.display = "grid";
        toggleBtn.textContent = "❌ Close Building View";

        if (!buildingLoaded) {
            renderBuilding();
            buildingLoaded = true;
        }

    } else {
        building.style.display = "none";
        toggleBtn.textContent = "🏢 Open Building View";
    }
};


// BUILDING RENDER FUNCTION
function renderBuilding() {

    building.innerHTML = "";

    apartments.forEach(a => {

        a.rooms.forEach(r => {

            const roomDiv = document.createElement("div");
            roomDiv.className = "room";
            roomDiv.id = `r${a.id}${r.room}`;
            roomDiv.textContent = `Apt ${a.id} - Room ${r.room}`;

            // click for details///////////////////////////////
 roomDiv.onclick = function () {

    const popup = document.createElement("div");

    let status = "Normal";

    if (r.pressure > 95 || r.temp > 85) {
        status = "🚨 Emergency";
    } else if (r.pressure > 85 || r.temp > 70) {
        status = "⚠️ Critical";
    } else if (r.pressure > 65) {
        status = "⚡ Warning";
    }

    popup.className = "room-popup";
    popup.innerHTML = `
        <b>Apartment ${a.id}</b><br>
        Room: ${r.room}<br>
        Temp: ${r.temp ?? "--"}°C<br>
        Pressure: ${r.pressure ?? "--"}%<br>
        Status: <b>${status}</b>
        <br><br>
        <button class="close-btn">Close</button>
    `;

    document.body.appendChild(popup);

    popup.querySelector(".close-btn").onclick = () => {
        popup.remove();
    };
};

            building.appendChild(roomDiv);
        });
    });
}


// LIVE UPDATER (connects to your if-statements)//////////////////////
function updateBuildingColors() {

    apartments.forEach(a => {

        a.rooms.forEach(r => {

            const el = document.getElementById(`r${a.id}${r.room}`);
            if (!el) return;

            let risk = calculateRisk(r.pressure, r.temp);

            let color = "#22c55e"; // green

            if (risk > 85) color = "#ff0000";       // red
            else if (risk > 70) color = "#f97316";  // orange
            else if (risk > 60) color = "#facc15";  // yellow

            el.style.background = color;
        });
    });
}