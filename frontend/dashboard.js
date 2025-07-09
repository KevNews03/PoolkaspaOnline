document.addEventListener('DOMContentLoaded', () => {
  const poolEl    = document.getElementById('stat-pool-hashrate');
  const networkEl = document.getElementById('stat-network-hashrate');
  const minersEl  = document.getElementById('stat-miners');
  const ctx       = document.getElementById('hashrate-chart').getContext('2d');
  let chart;

  // Charge et affiche les stats
  function loadStats() {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        poolEl.textContent    = data.poolHashrate + ' H/s';
        networkEl.textContent = data.networkHashrate + ' H/s';
        minersEl.textContent  = data.miners;

        const labels = (data.history || []).map(h => {
          const d = new Date(h.time * 1000);
          return d.toLocaleTimeString();
        });
        const values = (data.history || []).map(h => h.poolHashrate);

        if (chart) {
          chart.data.labels            = labels;
          chart.data.datasets[0].data  = values;
          chart.update();
        } else {
          chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [{
                label: 'Pool Hashrate',
                data: values,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79,70,229,0.1)',
                fill: true,
                tension: 0.4
              }]
            },
            options: {
              scales: { x: { display: true }, y: { display: true } }
            }
          });
        }
      })
      .catch(err => {
        console.error(err);
        poolEl.textContent = networkEl.textContent = minersEl.textContent = 'Erreur';
      });
  }

  // Rafraîchissement toutes les minutes
  loadStats();
  setInterval(loadStats, 60_000);

  // Recherche de mineur
  const lookupBtn  = document.getElementById('lookup-button');
  const minerInfo  = document.getElementById('miner-info');
  lookupBtn.addEventListener('click', () => {
    const addr = document.getElementById('miner-address').value.trim();
    if (!addr) return;
    fetch(`/api/miner/${addr}`)
      .then(res => res.json())
      .then(data => {
        minerInfo.innerHTML = `
          <h3>Address: ${addr}</h3>
          <p>Balance: ${data.balance} KAS</p>
          <p>Paid: ${data.paid} KAS</p>
        `;
      })
      .catch(err => {
        console.error(err);
        minerInfo.textContent = 'Erreur: ' + err;
      });
  });
});
