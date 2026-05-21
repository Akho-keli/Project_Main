document.getElementById("register_form").addEventListener("submit", Registration);

async function Registration(event) {
  event.preventDefault();

  let username = document.getElementById("username").value.trim();
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();
  let confirm_password = document.getElementById("confirm_password").value.trim();
  let Phone_Number = document.getElementById("code").value.trim();

  const strong_password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

  
  if (!username || !email || !password || !confirm_password || !Phone_Number) {
    alert("All fields are required");
    return;
  }

  if (username.length < 4) {
    alert("Username must be at least 4 characters long");
    return;
  }

  if (!email.endsWith("@gmail.com")) {
    alert("Email must be a valid Gmail address");
    return;
  }

  if (Phone_Number.length < 5) {
    alert("The admin Code must be at least 5 characters long");
    return;
  }

  if (password.length < 10) {
    alert("Password must be at least 10 characters long");
    return;
  }

  if (!strong_password.test(password)) {
    alert("Password must include uppercase, lowercase, number, special character");
    return;
  }
  if (password !== confirm_password) {
    alert("Passwords do not match");
    return;
  }
  // SEND TO BACKEND
  try {
    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
        Phone_Number 
      })
    });

    const result = await res.text();
    alert(result);

    if (result === "User registered successfully") {
      window.location.href = "Admin_Login.html";
    }

  } catch (err) {
    console.error(err);
    alert("Error connecting to server");
  }
}