let user = JSON.parse(localStorage.getItem("user"));

// show user info
document.getElementById("username").textContent = user.username;
document.getElementById("email").textContent = user.email;

// UPDATE
function updateProfile() {
    let newUsername = document.getElementById("newUsername").value;
    let newEmail = document.getElementById("newEmail").value;

    fetch("http://localhost:3000/updateProfile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            oldEmail: user.email,
            newUsername,
            newEmail
        })
    })
    .then(res => res.json())   
    .then(data => {
        alert(data.message);

        localStorage.setItem("user", JSON.stringify({
            username: data.user.username,
            email: data.user.email
        }));

        location.reload();
    })
    .catch(err => {
        console.error(err);
        alert("Update failed");
    });
}

// DELETE
function deleteProfile() {
    fetch("http://localhost:3000/deleteProfile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
        localStorage.removeItem("user");
        window.location.href = "HOME_PAGE.html";
    });
}