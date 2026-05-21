let allClaims = [];

// ===============================
// LOAD CLAIMS
// ===============================
async function loadClaims() {

  try {

    const res = await fetch("http://localhost:3000/claims");
    allClaims = await res.json();

    renderTable(allClaims);

  } catch (err) {
    console.log("Error loading claims:", err);
  }
}

// ===============================
// RENDER TABLE
// ===============================
function renderTable(data) {

  const tbody = document.getElementById("data");

  tbody.innerHTML = data.map(c => `
    <tr>

      <td>${c.client_name}</td>
      <td>${c.insurance_plan}</td>
      <td>${c.room_number}</td>
      <td>${c.damage_level}</td>
      <td>R ${c.claim_amount}</td>

      <td>
        <span class="status ${c.claim_status}">
          ${c.claim_status}
        </span>
      </td>

      <td>
        <button onclick="updateStatus(${c.id}, 'Approved')">
          Approve
        </button>

        <button onclick="updateStatus(${c.id}, 'Rejected')">
          Reject
        </button>
        
        <button onclick="deleteClaim(${c.id})">Delete</button>
      </td>

    </tr>
  `).join("");
}

// ===============================
// FILTER CLAIMS
// ===============================
document.getElementById("filter").onchange = (e) => {

  const value = e.target.value;

  if (value === "all") {
    renderTable(allClaims);
  } else {
    renderTable(
      allClaims.filter(c => c.insurance_plan === value)
    );
  }
};

// ===============================
// UPDATE STATUS (THIS TRIGGERS EMAIL)
// ===============================
async function updateStatus(id, status) {

  try {

    const res = await fetch("http://localhost:3000/claims/status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, status })
    });

    const data = await res.json();

    console.log(data);

    alert(`Claim ${status}`);

    // reload updated claims
    loadClaims();

  } catch (err) {
    console.log("Update error:", err);
    alert("Failed to update claim");
  }
}

async function deleteClaim(id) {

  try {

    const res = await fetch(`http://localhost:3000/claims/${id}`, {
      method: "DELETE"
    });

    const data = await res.text();

    console.log("Delete response:", data);

    loadClaims();

  } catch (err) {
    console.log("Delete error:", err);
  }
}

// ===============================
// INIT
// ===============================
loadClaims();