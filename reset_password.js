const API = "http://localhost:3000";

let userEmail = "";

// SEND OTP 
function sendOTP() {
    const emailInput = document.getElementById("email");
    const message = document.getElementById("message");

    userEmail = emailInput.value.trim();

    if (!userEmail) {
        message.innerText = "Please enter your email";
        return;
    }

    fetch(API + "/send-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: userEmail })
    })
    .then(res => res.text())
    .then(data => {
        message.innerText = data;

        //  Only show OTP section if success
        if (data.toLowerCase().includes("otp sent")) {
            document.getElementById("otpSection").classList.remove("hidden");
        }
    })
    .catch(err => {
        console.error(err);
        message.innerText = "Error sending OTP";
    });
}

// VERIFY OTP 
function verifyOTP() {
    const otp = document.getElementById("otp").value.trim();
    const message = document.getElementById("message");

    if (!otp) {
        message.innerText = "Enter OTP";
        return;
    }

    fetch(API + "/verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: userEmail, otp: otp })
    })
    .then(res => res.text())
    .then(data => {
        message.innerText = data;

        // Only allow password reset if verified
        if (data.toLowerCase().includes("verified")) {
            document.getElementById("passwordSection").classList.remove("hidden");
        }
    })
    .catch(err => {
        console.error(err);
        message.innerText = "Error verifying OTP";
    });
}

// RESET PASSWORD 
function resetPassword() {
    const newPassword = document.getElementById("newPassword").value.trim();
    const message = document.getElementById("message");

    if (!newPassword) {
        message.innerText = "Enter new password";
        return;
    }

    if (newPassword.length < 6) {
        message.innerText = "Password must be at least 6 characters";
        return;
    }

    fetch(API + "/reset-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: userEmail, newPassword: newPassword })
    })
    .then(res => res.text())
    .then(data => {
        message.innerText = data;

        if (data.toLowerCase().includes("success")) {
            //  Reset UI after success
            document.getElementById("otpSection").classList.add("hidden");
            document.getElementById("passwordSection").classList.add("hidden");
            document.getElementById("email").value = "";
            document.getElementById("otp").value = "";
            document.getElementById("newPassword").value = "";
        }
    })
    .catch(err => {
        console.error(err);
        message.innerText = "Error resetting password";
    });
}