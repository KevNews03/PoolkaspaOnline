document.addEventListener('DOMContentLoaded', () => {
  const feeInput       = document.getElementById('fee-input');
  const thresholdInput = document.getElementById('threshold-input');
  const settingsForm   = document.getElementById('settings-form');
  const paymentsTable  = document.querySelector('#payments-table tbody');

  // 1. Charger les paramètres existants
  fetch('/api/admin/settings')
    .then(r => r.json())
    .then(cfg => {
      feeInput.value       = cfg.feePercent;
      thresholdInput.value = cfg.paymentThreshold;
    })
    .catch(console.error);

  // 2. Sauvegarder les paramètres
  settingsForm.addEventListener('submit', e => {
    e.preventDefault();
    const payload = {
      feePercent:       parseFloat(feeInput.value),
      paymentThreshold: parseFloat(thresholdInput.value)
    };
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(res => alert('Settings saved!'))
      .catch(err => {
        console.error(err);
        alert('Error saving settings');
      });
  });

  // 3. Charger l'historique des paiements
  function loadPayments() {
    fetch('/api/admin/payments')
      .then(r => r.json())
      .then(payments => {
        paymentsTable.innerHTML = '';
        payments.forEach(p => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${p.address}</td>
            <td>${p.amount.toFixed(4)}</td>
            <td>${new Date(p.date).toLocaleString()}</td>
          `;
          paymentsTable.appendChild(tr);
        });
      })
      .catch(console.error);
  }

  loadPayments();
  // raffraîchir toutes les 5 minutes
  setInterval(loadPayments, 300_000);
});
