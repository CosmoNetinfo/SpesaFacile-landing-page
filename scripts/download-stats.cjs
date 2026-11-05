const fs = require('node:fs');
const path = require('node:path');

const repository = 'CosmoNetinfo/SpesaFacile';

function snapshot(releases, now = new Date()) {
  if (!Array.isArray(releases)) throw new Error('Invalid releases response');
  const assets = [];
  const ids = new Set();
  for (const release of releases) {
    if (release.draft || release.prerelease) continue;
    if (!Array.isArray(release.assets)) throw new Error('Missing release assets');
    for (const asset of release.assets) {
      if (!/\.apk$/i.test(asset.name) || asset.state !== 'uploaded') continue;
      if (!Number.isSafeInteger(asset.id) || asset.id <= 0 || ids.has(asset.id)) throw new Error('Invalid or duplicate asset ID');
      if (!Number.isSafeInteger(asset.download_count) || asset.download_count < 0) throw new Error('Invalid download count');
      ids.add(asset.id);
      assets.push({ id: asset.id, version: release.tag_name, name: asset.name, downloads: asset.download_count });
    }
  }
  assets.sort((a, b) => a.id - b.id);
  const totalDownloads = assets.reduce((sum, asset) => sum + asset.downloads, 0);
  if (!Number.isSafeInteger(totalDownloads)) throw new Error('Invalid total');
  const observedAt = now.toISOString();
  return { date: observedAt.slice(0, 10), observedAt, totalDownloads, assets };
}

function appendSnapshot(history, next) {
  if (history.schemaVersion !== 1 || history.repository !== repository || !Array.isArray(history.snapshots)) {
    throw new Error('Unsupported download history');
  }
  // Re-running within one UTC day refreshes its observation, preserving previous days.
  return { ...history, snapshots: [...history.snapshots.filter(row => row.date !== next.date), next].sort((a, b) => a.date.localeCompare(b.date)) };
}

function csv(history) {
  const quote = value => '"' + String(value).replaceAll('"', '""') + '"';
  const lines = ['date_utc,observed_at,version,asset_id,asset_name,downloads'];
  for (const row of history.snapshots) for (const asset of row.assets) {
    lines.push([row.date, row.observedAt, asset.version, asset.id, asset.name, asset.downloads].map(quote).join(','));
  }
  return lines.join('\n') + '\n';
}

async function fetchReleases(fetcher = fetch) {
  const all = [];
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'SpesaFacile-download-statistics' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  for (let page = 1; page <= 100; page++) {
    const response = await fetcher(`https://api.github.com/repos/${repository}/releases?per_page=100&page=${page}`, {
      headers, signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error(`GitHub releases: HTTP ${response.status}`);
    const releases = await response.json();
    if (!Array.isArray(releases)) throw new Error('Invalid GitHub response');
    all.push(...releases);
    if (releases.length < 100) return all;
  }
  throw new Error('Release pagination limit exceeded; previous data retained');
}

async function collect() {
  const directory = path.resolve(__dirname, '../assets/data');
  const historyPath = path.join(directory, 'download-history.json');
  const previous = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath, 'utf8'))
    : { schemaVersion: 1, repository, snapshots: [] };
  const next = snapshot(await fetchReleases());
  const history = appendSnapshot(previous, next);
  // Fetch and validate the complete result before changing any existing data.
  fs.mkdirSync(directory, { recursive: true });
  const files = {
    'downloads.json': JSON.stringify({ schemaVersion: 1, repository, ...next }, null, 2) + '\n',
    'download-history.json': JSON.stringify(history, null, 2) + '\n',
    'download-history.csv': csv(history)
  };
  for (const [name, content] of Object.entries(files)) {
    const target = path.join(directory, name);
    fs.writeFileSync(target + '.tmp', content);
    fs.renameSync(target + '.tmp', target);
  }
  console.log(JSON.stringify({ observedAt: next.observedAt, totalDownloads: next.totalDownloads, apkAssets: next.assets.length, historyDays: history.snapshots.length }));
}

module.exports = { snapshot, appendSnapshot, csv, fetchReleases };
if (require.main === module) collect().catch(error => { console.error(error.message); process.exitCode = 1; });
