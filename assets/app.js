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
