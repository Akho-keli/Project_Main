// Get the form by its actual ID in your HTML
document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // prevent default form submission

    // Get values from the inputs
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json(); //  FIXED (was text)

        // Check backend response
        if (response.ok && data.message === "Login Successful") {
            
            // STORE FULL USER OBJECT
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect to dashboard
            window.location.href = "User_dash.html";

        } else {
            alert(data.message || "Login failed");
        }

    } catch (error) {
        console.error(error);
        alert("Account not Found!!!");
    }
});


// SHOW / HIDE PASSWORD
let show = document.getElementById("show");
let password_ = document.getElementById("password");

show.addEventListener("change", function(){
    if(show.checked) {
        password_.type = "text";
    } else {
        password_.type = "password";
    }
});