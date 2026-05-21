
// This function loads reports from localStorage and displays them in the table
function loadReports() {

    // Get reports from localStorage (or empty array if none exist)
    let reports = JSON.parse(localStorage.getItem("reports")) || [];

    // Get table body element where rows will be displayed
    let table = document.getElementById("adminTable");

    // Clear table to prevent duplicate rows
    table.innerHTML = "";

    // Loop through all reports
    reports.forEach((r, index) => {

        // Check if report is resolved
        let isResolved = r.status === "Resolved";

        // Create table row for each report
        let row = `
            <tr>

                <!-- Username column -->
                <td>${r.username}</td>

                <!-- Issue column -->
                <td>${r.issue}</td>

                <!-- Status column (green if resolved, orange if pending) -->
                <td style="color:${isResolved ? "green" : "orange"}">
                    ${r.status}
                </td>

                <!-- Action column -->
                <td>
                    ${
                        isResolved
                        ? `<button onclick="toggleStatus(${index})">Resolved</button>`
                        : `<button onclick="toggleStatus(${index})">Mark Resolved</button>`
                    }

                    <!-- Delete button -->
                    <button onclick="deleteReport(${index})" style="margin-left:5px; color:red;">
                        Delete
                    </button>
                </td>

                <!-- Feedback column -->
                <td>
                    <input 
                        type="text" 
                        id="feedback-${index}" 
                        value="${r.feedback || ""}" 
                        placeholder="Write feedback"
                    >

                    <button onclick="sendFeedback(${index})">Send</button>
                </td>

            </tr>
        `;

        // Add row to table
        table.innerHTML += row;
    });
}


// TOGGLE STATUS
// This function switches status between Pending and Resolved
function toggleStatus(index) {

    let reports = JSON.parse(localStorage.getItem("reports")) || [];

    // Toggle status
    reports[index].status =
        reports[index].status === "Resolved" ? "Pending" : "Resolved";

    // Save updated data
    localStorage.setItem("reports", JSON.stringify(reports));

    // Reload table
    loadReports();
}


// SEND FEEDBACK
// This function saves admin feedback and marks report as resolved
function sendFeedback(index) {

    let reports = JSON.parse(localStorage.getItem("reports")) || [];

    // Get feedback input value
    let feedbackInput = document.getElementById(`feedback-${index}`);

    // Save feedback into report
    reports[index].feedback = feedbackInput.value.trim();

    // Automatically mark as resolved when feedback is sent
    reports[index].status = "Resolved";

    // Save updated data
    localStorage.setItem("reports", JSON.stringify(reports));

    // Reload table
    loadReports();
}


// DELETE REPORT 
// This function removes a report completely
function deleteReport(index) {

    let reports = JSON.parse(localStorage.getItem("reports")) || [];

    // Remove selected report using index
    reports.splice(index, 1);

    // Save updated array back to localStorage
    localStorage.setItem("reports", JSON.stringify(reports));

    // Reload table
    loadReports();
}


// Run this when page loads
loadReports();