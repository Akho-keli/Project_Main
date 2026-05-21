// ===============================
// INSURANCE COVER PLANS
// ===============================
const plans = [
  { id:"basic", name:"Basic", base:100, fee:0.01, cov:0.50 },
  { id:"standard", name:"Standard", base:250, fee:0.03, cov:0.75 },
  { id:"premium", name:"Premium", base:500, fee:0.06, cov:1.00 }
];

// ===============================
// APARTMENTS
// ===============================
const apartments = [
  { id:101, rooms:[{r:1,p:60,t:30},{r:2,p:70,t:35},{r:3,p:50,t:28},{r:4,p:65,t:40}] },
  { id:102, rooms:[{r:1,p:72,t:45},{r:2,p:68,t:38},{r:3,p:55,t:32},{r:4,p:60,t:36}] },
  { id:103, rooms:[{r:1,p:50,t:30},{r:2,p:65,t:40},{r:3,p:70,t:42},{r:4,p:55,t:35}] },
  { id:104, rooms:[{r:1,p:80,t:60},{r:2,p:75,t:50},{r:3,p:68,t:45},{r:4,p:70,t:48}] }
];

// ===============================
// APPLICATION STATE
// ===============================
let state = {
  aptId:101,
  plan:null,
  items:[],
  paid:false
};

// ===============================
// HELPERS
// ===============================
function calcRisk(p,t){
  return (p * 0.6) + (t * 0.4);
}

function fmt(n){
  return "R " + Math.round(n).toLocaleString();
}

// ===============================
// BUILD APARTMENT TABS
// ===============================
function buildTabs(){

  const c = document.getElementById("tabs");

  c.innerHTML = "";

  apartments.forEach(a=>{

    const d = document.createElement("div");

    d.className =
      "apt-tab" +
      (state.aptId === a.id ? " active" : "");

    d.textContent = "Apt " + a.id;

    d.onclick = ()=>{

      state = {
        aptId:a.id,
        plan:null,
        items:[],
        paid:false
      };

      buildTabs();
      buildPlans();
      renderItems();
      updateStats();

      document
        .getElementById("report")
        .classList.remove("show");
    };

    c.appendChild(d);
  });
}

// ===============================
// BUILD PLANS
// ===============================
function buildPlans(){

  const c = document.getElementById("plans");

  c.innerHTML = "";

  plans.forEach(p=>{

    const total =
      state.items.reduce((s,i)=>s+i.amount,0);

    const fee =
      p.base + Math.round(total * p.fee);

    const d = document.createElement("div");

    d.className =
      "plan-card" +
      (state.plan === p.id ? " selected":"");

    d.innerHTML = `
      <div class="plan-name">${p.name}</div>

      <div class="plan-fee">
        ${fmt(fee)}/month
      </div>

      <div class="plan-desc">
        ${p.cov * 100}% coverage
      </div>
    `;

    d.onclick = ()=>{

      state.plan = p.id;

      state.paid = false;

      buildPlans();

      updateStats();
    };

    c.appendChild(d);
  });
}

// ===============================
// RENDER ITEMS
// ===============================
function renderItems(){

  const c = document.getElementById("list");

  if(!state.items.length){

    c.innerHTML =
      '<p class="empty">No items registered yet.</p>';

    return;
  }

  c.innerHTML = state.items.map((it,i)=>`

    <div class="item-row">

      <span>${it.cat}</span>

      <span>${it.name}</span>

      <span>${fmt(it.amount)}</span>

      <button onclick="removeItem(${i})">
        Remove
      </button>

    </div>

  `).join("");
}

// ===============================
// REMOVE ITEM
// ===============================
function removeItem(i){

  state.items.splice(i,1);

  renderItems();

  buildPlans();

  updateStats();
}

// ===============================
// UPDATE STATS
// ===============================
function updateStats(){

  const total =
    state.items.reduce((s,i)=>s+i.amount,0);

  const p =
    plans.find(x=>x.id===state.plan);

  const fee =
    p ? p.base + Math.round(total * p.fee) : 0;

  document.getElementById("total")
    .textContent = fmt(total);

  document.getElementById("fee")
    .textContent = p ? fmt(fee) : "R 0";

  document.getElementById("limit")
    .textContent =
      p ? fmt(total * p.cov) : "—";

  document.getElementById("plan")
    .textContent =
      (state.paid && p)
      ? p.name
      : "None";
}

// ===============================
// BUILDING STATUS
// ===============================
function updateBuildingStatus(){

  const allRooms =
    apartments.flatMap(a=>a.rooms);

  const avg =
    allRooms.reduce(
      (s,r)=>s+calcRisk(r.p,r.t),
      0
    ) / allRooms.length;

  const badge =
    document.getElementById("status");

  if(avg > 85){

    badge.textContent =
      "Building: Danger";

  } else if(avg > 70){

    badge.textContent =
      "Building: High Risk";

  } else if(avg > 50){

    badge.textContent =
      "Building: Moderate";

  } else {

    badge.textContent =
      "Building: Safe";
  }
}

// ===============================
// ROOM SIMULATION
// ===============================
function simulateRooms(){

  apartments.forEach(a=>{

    a.rooms.forEach(r=>{

      r.p = Math.max(
        0,
        Math.min(
          110,
          r.p + (Math.random()*10-5)
        )
      );

      r.t = Math.max(
        20,
        Math.min(
          100,
          r.t + (Math.random()*6-3)
        )
      );
    });
  });

  updateBuildingStatus();
}

// ===============================
// ADD ITEM
// ===============================
document.getElementById("add").onclick =
async ()=>{

  const cat =
    document.getElementById("cat").value;

  const itemName =
    document.getElementById("item")
    .value.trim();

  const amount =
    Number(
      document.getElementById("value").value
    );

  const clientName =
    document.getElementById("name")
    .value.trim();

  if(!itemName){

    alert("Enter item name");

    return;
  }

  if(amount <= 0){

    alert("Enter valid value");

    return;
  }

  state.items.push({
    cat,
    name:itemName,
    amount
  });
  // ===============================
// SHOW ITEM BELOW CATEGORY SECTION
// ===============================

const categorySection =
  document.getElementById("cat");

const itemDisplay =
  document.createElement("div");

itemDisplay.className = "saved-item";

itemDisplay.innerHTML = `
  <p>
    <strong>Category:</strong> ${category}
  </p>

  <p>
    <strong>Item:</strong> ${itemName}
  </p>

  <p>
    <strong>Client:</strong> ${clientName}
  </p>

  <p>
    <strong>Amount:</strong> ${fmt(amount)}
  </p>

  <hr>
`;

categorySection.parentElement.appendChild(itemDisplay);

  // SAVE ITEM TO DATABASE
  try{

    await fetch(
      "http://localhost:3000/items",
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          clientName,
          category:cat,
          itemName,
          amount
        })
      }
    );

  } catch(err){

    console.log(err);
  }

  document.getElementById("item").value = "";
  document.getElementById("value").value = "";

  renderItems();

  buildPlans();

  updateStats();
};

// ===============================
// PAYMENT SYSTEM
// ===============================
document.getElementById("pay").onclick = async () => {

  const name =
    document.getElementById("name")
    .value.trim();

  const email =
    document.getElementById("email")
    .value.trim();   // ✅ ADDED EMAIL

  const num =
    document.getElementById("card")
    .value.trim();

  if (!state.plan) {
    alert("Select plan first");
    return;
  }

  if (!state.items.length) {
    alert("Add items first");
    return;
  }

  if (!name) {
    alert("Enter your name");
    return;
  }

  if (!email) {
    alert("Enter your email");   // OPTIONAL BUT IMPORTANT
    return;
  }

  if (num.replace(/\s/g, "").length < 12) {
    alert("Invalid card");
    return;
  }

  const p =
    plans.find(x => x.id === state.plan);

  const total =
    state.items.reduce((s, i) => s + i.amount, 0);

  const monthly =
    p.base + Math.round(total * p.fee);

  try {

    const res = await fetch("http://localhost:3000/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name,
        email,        
        plan: p.name,
        monthly
      })
    });

    const data = await res.json();

    console.log(data);

    state.paid = true;

    alert("Plan activated successfully");

    updateStats();

  } catch (err) {

    console.log(err);

    alert("Database error");
  }
};

document.getElementById("claim").onclick =
()=>{

  if(!state.paid || !state.plan){

    alert("Activate plan first");

    return;
  }

  const p =
    plans.find(x=>x.id===state.plan);

  const room =
    document.getElementById("room").value;

  const dmg =
    parseFloat(
      document.getElementById("damage").value
    );

  document.getElementById("rtype")
    .textContent = p.name;

  document.getElementById("rinfo")
    .textContent = `Room: ${room}`;

  document.getElementById("ritems")
    .innerHTML = state.items.map(i=>`

      <div>
        ${i.name} - ${fmt(i.amount * dmg)}
      </div>

    `).join("");

  document.getElementById("rtotal")
    .textContent = "Claim generated";

  document.getElementById("rfooter")
    .textContent = "Submitted for review";

  document.getElementById("report")
    .classList.add("show");

  // ===============================
  // SAVE CLAIM TO DATABASE
  // ===============================
  (async () => {
    try {

      const total =
        state.items.reduce((s,i)=>s+i.amount,0);

      const claimAmount = total * dmg;

      await fetch("http://localhost:3000/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          clientName: document.getElementById("name").value,
          clientEmail: document.getElementById("email").value,
          room: room,
          damageLevel: dmg,
          claimAmount: claimAmount,
          insurancePlan: p.name
        })
      });

      console.log("Claim saved to database");

    } catch (err) {
      console.log("Database error (claim):", err);
    }
  })();
};
// ===============================
// OVERDUE USERS
// ===============================
async function showOverdueAlert(){

  try{

    const res =
      await fetch(
        "http://localhost:3000/overdue"
      );

    const data =
      await res.json();

    if(data.length > 0){

      console.log("Overdue Payments");

      data.forEach(u=>{

        console.log(
          `${u.name} - ${u.plan} - R ${u.monthly}`
        );
      });
    }

  } catch(err){

    console.log(err);
  }
}

// ===============================
// START APPLICATION
// ===============================
buildTabs();

buildPlans();

renderItems();

updateStats();

updateBuildingStatus();

// ===============================
// INTERVALS
// ===============================
setInterval(simulateRooms,3000);

setInterval(showOverdueAlert,10000);