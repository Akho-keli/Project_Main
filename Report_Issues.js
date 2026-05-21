// Function to load user reports from localStorage and display in the table
function loadUserReports() {
    let reports = JSON.parse(localStorage.getItem("reports")) || [];
    let table = document.getElementById("userReports");
    table.innerHTML = ""; // Clear previous rows

    reports.forEach(r => {
        let row = `
            <tr>
                <td>${r.username}</td>
                <td>${r.issue}</td>
                <td style="color:${r.status === "Resolved" ? "green" : "orange"}">
                    ${r.status}
                </td>
                <td>${r.feedback || "No feedback yet"}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

// Event listener: Submit report form
document.getElementById("reportForm").addEventListener("submit", function(e){
    e.preventDefault(); // Prevent page reload

    let username = document.getElementById("username").value.trim();
    let issue = document.getElementById("issue").value.trim();

    if (!username || !issue) {
        alert("Please fill in all fields.");
        return;
    }

    let reports = JSON.parse(localStorage.getItem("reports")) || [];

    let newReport = {
        username: username,
        issue: issue,
        status: "Pending",
        feedback: ""
    };

    reports.push(newReport);
    localStorage.setItem("reports", JSON.stringify(reports));

    alert("Report submitted!");
    document.getElementById("reportForm").reset();
    loadUserReports(); // Refresh table
});

// Event listener: Send issue via email
document.getElementById("send").addEventListener("click", function () {
    const issue = document.getElementById("issue").value.trim();
    const email = document.getElementById("adminEmail").value.trim();

    if (!issue || !email) {
        alert("Please fill in both the issue and admin email.");
        return;
    }

    const subject = encodeURIComponent("Tenant Issue Report");
    const body = encodeURIComponent("Issue reported:\n\n" + issue);

    // Correct syntax for mailto
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
});

// INITIAL LOAD: Display reports when page loads
loadUserReports();