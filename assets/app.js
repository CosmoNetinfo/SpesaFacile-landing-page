'use strict';
const checks = [...document.querySelectorAll('.grocery input')];
function updateDemo() {
  const count = checks.filter(input => input.checked).length;
  document.getElementById('progress-bar').style.width = `${count / checks.length * 100}%`;
  document.getElementById('progress-text').textContent = `${count} di ${checks.length} nel carrello`;
  document.getElementById('demo-message').textContent = count === checks.length ? 'Tutto preso. Si va alla cassa! ✓' : 'Tocca i prodotti per spuntarli';
}
checks.forEach(input => input.addEventListener('change', updateDemo));
document.getElementById('reset-demo').addEventListener('click', () => {
  checks.forEach(input => { input.checked = false; });
  updateDemo();
});
updateDemo();
async function latestRelease() {
  try {
    const response = await fetch('https://api.github.com/repos/CosmoNetinfo/SpesaFacile/releases/latest', {
      signal: AbortSignal.timeout(5000), headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) return;
    const release = await response.json();
    if (/^v?\d+(\.\d+){1,3}$/.test(release.tag_name)) {
      document.getElementById('release-label').textContent = `Ultima release disponibile: ${release.tag_name}`;
    }
  } catch { /* Il link alla release resta disponibile anche senza API. */ }
}
latestRelease();

async function downloadStatistics() {
  const count = document.getElementById('download-count');
  const updated = document.getElementById('download-updated');
  try {
    const response = await fetch('assets/data/downloads.json', { signal: AbortSignal.timeout(5000), cache: 'no-cache' });
    if (!response.ok) throw new Error('Statistics unavailable');
    const statistics = await response.json();
    if (statistics.schemaVersion !== 1 || !Number.isSafeInteger(statistics.totalDownloads) || statistics.totalDownloads < 0) throw new Error('Invalid statistics');
    const date = new Date(statistics.observedAt);
    if (!Number.isFinite(date.getTime())) throw new Error('Invalid observation date');
    count.textContent = `${new Intl.NumberFormat('it-IT').format(statistics.totalDownloads)} download APK su GitHub`;
    updated.textContent = `Rilevazione del ${new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Rome' }).format(date)} (ora italiana). Aggiornamento giornaliero.`;
  } catch {
    count.textContent = 'Conteggio download al momento non disponibile';
    updated.textContent = 'Puoi comunque scaricare l’app dal link qui sopra.';
  }
}
downloadStatistics();
