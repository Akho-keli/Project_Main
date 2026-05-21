let chosenSupplier = '';

function pickSupplier(el) {
  document.querySelectorAll('.supplier-btn').forEach(function(b) {
    b.classList.remove('sel');
  });
  el.classList.add('sel');
  chosenSupplier = el.dataset.s;
}

function syncTank() {

  let lvl = parseFloat(document.getElementById('gasLevel').value);

  if (!isNaN(lvl) && lvl >= 0 && lvl <= 100) {

    document.getElementById('tank-fill').style.width = lvl + '%';
    let col = lvl <= 20 ? '#e24b4a' : lvl <= 40 ? '#ef9f27' : '#639922';
    document.getElementById('tank-fill').style.background = col;
    document.getElementById('pctBig').textContent = Math.round(lvl) + '%';
  }
}

function calculateRefill() {
  let  level = parseFloat(document.getElementById('gasLevel').value);
  let usage = parseFloat(document.getElementById('dailyUsage').value);

  if (isNaN(level) || isNaN(usage)) {
    setAlert('idle', 'Please enter valid numbers for both fields.');
    return;
  }
  if (level < 0 || level > 100) {
    setAlert('danger', 'Gas level must be between 0 and 100.');
    return;
  }
  if (usage <= 0) {
    setAlert('danger', 'Daily usage must be greater than 0.');
    return;
  }

  let days = Math.round(level / usage);

  document.getElementById('daysBig').textContent = days;
  document.getElementById('pctBig').textContent = Math.round(level) + '%';
  syncTank();

  if (days <= 3) {
    setAlert('danger', 'Urgent — only ' + days + ' day' + (days === 1 ? '' : 's') + ' left. Book a refill immediately.');
    document.getElementById('tank-label').textContent = 'Critical';
  } else if (days <= 6) {
    setAlert('warn', 'Running low  about ' + days + ' days remaining. Refill soon.');
    document.getElementById('tank-label').textContent = 'Getting low';
  } else {
    setAlert('ok', 'You\'re in good shape — approximately ' + days + ' days of gas left.');
    document.getElementById('tank-label').textContent = 'Sufficient';
  }
}

function setAlert(type, msg) {
  let bar = document.getElementById('alertBar');
  bar.className = 'alert alert-' + type;
  document.getElementById('alertText').textContent = msg;
}

function bookRefill() {
  let date = document.getElementById('date').value;
  let err = document.getElementById('bookErr');
  let conf = document.getElementById('bookConfirm');

  err.classList.add('hidden');
  conf.classList.add('hidden');

  if (!chosenSupplier || !date) {
    err.textContent = 'Please select a supplier and a delivery date.';
    err.classList.remove('hidden');
    return;
  }

  let selected = new Date(date);
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selected < today) {
    err.textContent = 'Delivery date cannot be in the past.';
    err.classList.remove('hidden');
    return;
  }

  let fmt = selected.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  document.getElementById('confirmHead').textContent = 'Booking confirmed with ' + chosenSupplier;
  document.getElementById('confirmSub').textContent = 'Delivery scheduled for ' + fmt;
  conf.classList.remove('hidden');
}


function estimateCost() {
  let tankSize   = parseFloat(document.getElementById('tankSize').value);
  let fillPct    = parseFloat(document.getElementById('fillPercent').value);
  let priceGasCo    = parseFloat(document.getElementById('priceGasCo').value);
  let priceQuickGas = parseFloat(document.getElementById('priceQuickGas').value);
  let priceHomeGas  = parseFloat(document.getElementById('priceHomeGas').value);

  let costErr = document.getElementById('costErr');
  let costResults = document.getElementById('costResults');
  costErr.classList.add('hidden');
  costResults.classList.add('hidden');

  if (isNaN(tankSize) || tankSize <= 0) {
    costErr.textContent = 'Please enter a valid tank size.';
    costErr.classList.remove('hidden');
    return;
  }
  if (isNaN(fillPct) || fillPct <= 0 || fillPct > 100) {
    costErr.textContent = 'Fill amount must be between 1 and 100%.';
    costErr.classList.remove('hidden');
    return;
  }
  if (isNaN(priceGasCo) || isNaN(priceQuickGas) || isNaN(priceHomeGas)) {
    costErr.textContent = 'Please enter a price per kg for all three suppliers.';
    costErr.classList.remove('hidden');
    return;
  }

  let kgNeeded = (fillPct / 100) * tankSize;

  let costs = {
    GasCo:    Math.round(kgNeeded * priceGasCo),
    QuickGas: Math.round(kgNeeded * priceQuickGas),
    HomeGas:  Math.round(kgNeeded * priceHomeGas)
  };

  document.getElementById('amtGasCo').textContent    = 'R' + costs.GasCo;
  document.getElementById('amtQuickGas').textContent = 'R' + costs.QuickGas;
  document.getElementById('amtHomeGas').textContent  = 'R' + costs.HomeGas;

  ['GasCo','QuickGas','HomeGas'].forEach(function(s) {
    document.getElementById('badge' + s).classList.add('hidden');
    document.getElementById('cost' + s).classList.remove('cheapest');
  });

  let minCost = Math.min(costs.GasCo, costs.QuickGas, costs.HomeGas);
  ['GasCo','QuickGas','HomeGas'].forEach(function(s) {
    if (costs[s] === minCost) {
      document.getElementById('badge' + s).classList.remove('hidden');
      document.getElementById('cost' + s).classList.add('cheapest');
    }
  });

  costResults.classList.remove('hidden');
}

document.getElementById('estimateBtn').addEventListener('click', estimateCost);

document.getElementById('checkBtn').addEventListener('click', calculateRefill);
document.getElementById('gasLevel').addEventListener('input', syncTank);