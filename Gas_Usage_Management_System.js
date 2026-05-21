// Initialize localStorage if empty
if (!localStorage.getItem("gasData")) {
  localStorage.setItem("gasData", JSON.stringify([]));
}

function getStatus(usage) {
  if (usage > 50 ) return { label: "Needs Investigation", cls: "investigate" };
  if (usage > 60) return { label: "Irregular Usage",    cls: "irregular" };
  if (usage > 100) return { label: "Too Much Usage",     cls: "high" };
  return { label: "Normal", cls: "normal" };
}

function loadDashboard() {
  const data = JSON.parse(localStorage.getItem("gasData"));

  const totalEl  = document.getElementById("totalUsage");
  const roomsEl  = document.getElementById("activeRooms");
  const tableEl  = document.getElementById("roomTable");
  const alertsEl = document.getElementById("alerts");

  if (data.length === 0) {
    totalEl.innerHTML  = '0 <span class="stat-unit">units</span>';
    roomsEl.textContent = "0";
    tableEl.innerHTML  = '<tr><td colspan="3" class="empty-msg">No data yet. Add usage to get started.</td></tr>';
    alertsEl.innerHTML = '<p class="empty-msg">No alerts — all rooms normal.</p>';
    return;
  }

  // Group by room
  const summary = {};
  data.forEach(d => {
    if (!summary[d.room]) summary[d.room] = 0;
    summary[d.room] += Number(d.usage);
  });

  const rooms = Object.keys(summary).map(room => ({ room, usage: summary[room] }));
  const total = rooms.reduce((sum, r) => sum + r.usage, 0);

  totalEl.innerHTML   = total.toLocaleString() + ' <span class="stat-unit">units</span>';
  roomsEl.textContent = rooms.length;

  // Render table
  tableEl.innerHTML = rooms.map(r => {
    const s = getStatus(r.usage);
    return `
      <tr>
        <td>${r.room}</td>
        <td>${r.usage.toLocaleString()}</td>
        <td><span class="badge badge-${s.cls}">${s.label}</span></td>
      </tr>`;
  }).join('');

  // Render alerts
  const abnormal = rooms.filter(r => getStatus(r.usage).cls !== 'normal');
  if (abnormal.length === 0) {
    alertsEl.innerHTML = '<p class="empty-msg">No alerts — all rooms normal.</p>';
  } else {
    alertsEl.innerHTML = abnormal.map(r => {
      const s = getStatus(r.usage);
      return `
        <div class="alert-item alert-${s.cls}">
          <div class="alert-dot"></div>
          <div><strong>${r.room}</strong> — ${s.label}</div>
        </div>`;
    }).join('');
  }
}

function addUsage() {
  const room  = document.getElementById("roomInput").value.trim();
  const usage = Number(document.getElementById("usageInput").value);
  const date  = document.getElementById("dateInput").value;

  if (!room || !usage || !date) {
    alert("Please fill in all fields.");
    return;
  }
  if (usage <= 0) {
    alert("Usage must be greater than 0.");
    return;
  }

  const data = JSON.parse(localStorage.getItem("gasData"));
  data.push({ room, usage, date });
  localStorage.setItem("gasData", JSON.stringify(data));

  document.getElementById("roomInput").value  = "";
  document.getElementById("usageInput").value = "";
  document.getElementById("dateInput").value  = "";

  loadDashboard();
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc  = new jsPDF();
  const data = JSON.parse(localStorage.getItem("gasData"));

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text("Gas Usage Report", 14, 18);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(120);
  doc.text("Generated: " + new Date().toLocaleDateString('en-ZA'), 14, 26);
  doc.setTextColor(0);

  // Header
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  let y = 38;
  doc.text("Room",  14,  y);
  doc.text("Usage", 80,  y);
  doc.text("Date",  130, y);
  doc.text("Status",165, y);

  doc.setLineWidth(0.3);
  doc.line(14, y + 2, 196, y + 2);
  y += 10;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  data.forEach(d => {
    const status = getStatus(Number(d.usage)).label;
    doc.text(String(d.room),   14,  y);
    doc.text(String(d.usage),  80,  y);
    doc.text(String(d.date),   130, y);
    doc.text(status,           165, y);
    y += 9;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  doc.save("gas_usage_report.pdf");
}

function resetSystem() {
  if (!confirm("Are you sure you want to reset all gas data? This cannot be undone.")) return;
  localStorage.setItem("gasData", JSON.stringify([]));
  loadDashboard();
}

loadDashboard();