const AIAssistant = {
    toggle() {
    const chat = document.getElementById("ai-chat-window");
    const robot = document.getElementById("ai-robot-float");

    // OPEN CHAT
    if (chat.style.display === "flex") {
        chat.style.display = "none";

        // show robot again
        robot.style.display = "block";

    } else {
        chat.style.display = "flex";

        // hide robot
        robot.style.display = "none";
    }
        
    },
    minimize() {
    const chat = document.getElementById("ai-chat-window");
    chat.classList.remove("maximized");
    chat.classList.toggle("minimized");
},

maximize() {
    const chat = document.getElementById("ai-chat-window");
    chat.classList.remove("minimized");
    chat.classList.toggle("maximized");
},

    async sendMessage() {
        const input = document.getElementById("ai-input");
        const text = input.value.trim();

        if (!text) return;

        this.addMessage(text, "user-msg");
        input.value = "";

        try {
            //  ALWAYS use full backend URL (fixes Live Server issue)
            const BASE_URL = "http://localhost:5001";

            // Get live system data
            const systemRes = await fetch(`${BASE_URL}/system`);
            const systemData = await systemRes.json();

            const issues = [
                systemData.apartment.gas < 20 ? "Low Gas" : null,
                systemData.apartment.temp > 35 ? "High Temperature" : null
            ].filter(Boolean);

            const res = await fetch(`${BASE_URL}/ai`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                message: text,
                systemData: {
                apartment: {
                gas: systemData.apartment.gas,
                temp: systemData.apartment.temp },
               cylinders: systemData.cylinders,
               prediction: {
               rate: systemData.rate,
               timeLeft:systemData.timeLeft
        }
    }
})
            });

            const data = await res.json();

            this.addMessage(data.reply || "No response from AI", "bot-msg");

        } catch (err) {
            console.error("AI ERROR:", err);
            this.addMessage("Error connecting to AI (check backend)", "bot-msg");
        }
    },

    addMessage(text, className) {
    const box = document.getElementById("ai-chat-box");

    const div = document.createElement("div");

    let statusClass = "";

    if (text.includes("Status: YES")) statusClass = "safe";
    if (text.includes("Status: NO")) statusClass = "danger";

    div.className = `ai-msg ${className} ${statusClass}`;

    div.innerHTML = text
        .replace(/\n/g, "<br>")
        .replace("Status:", "<b>Status:</b>")
        .replace("Reason:", "<br><b>Reason:</b>")
        .replace("ACTION REQUIRED:", "<br><b> ACTION REQUIRED:</b>");

    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}
};

// ENTER KEY SUPPORT
document.getElementById("ai-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        AIAssistant.sendMessage();
    }
});

//=======ENDS HERE AI FRONTEND======
