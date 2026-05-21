document.getElementById("register_form").addEventListener("submit", Registration);

async function Registration(event) {
  
  event.preventDefault();

  let username = document.getElementById("username").value.trim();
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();
  let confirm_password = document.getElementById("confirm_password").value.trim();
  let Phone_Number = document.getElementById("Phone_Number").value.trim();

  if (!username || !email || !password || !confirm_password || !Phone_Number) {
    alert("All fields are required");
    return;
  }

  if (password !== confirm_password) {
    alert("Passwords do not match");
    return;
  }

  try {

    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, Phone_Number })
    });

    const result = await res.text();
    alert(result);

    if (result === "User registered successfully") {
      window.location.href = "User_Login.html";
    }

  } catch (err) {
    alert("Error connecting to server");
  }
}