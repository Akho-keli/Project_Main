document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    //ADD THIS (admin code input)
    const code = document.getElementById("Code").value;

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password, code }) 
        });

        const data = await response.json(); 

        if (response.ok && data.message === "Login Successful") {

            window.location.href = "dashboard.html";

        } else {
            alert(data.message || "Login failed");
        }

    } catch (error) {
        console.error(error);
        alert("Account doesn't exist");
    }
});
// This is for the show password
let show = document.getElementById("show");
let password_ = document.getElementById("password");

show.addEventListener("change", function () {
    if (show.checked) {
        password_.type = "text";
    } else {
        password_.type = "password";
    }
});