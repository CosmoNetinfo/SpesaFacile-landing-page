(function (root) {
  'use strict';
  function versions(snapshot) {
    const grouped = new Map();
    for (const asset of snapshot.assets) {
      if (!Number.isSafeInteger(asset.downloads) || asset.downloads < 0 || typeof asset.version !== 'string') throw new Error('Invalid statistics');
      grouped.set(asset.version, (grouped.get(asset.version) || 0) + asset.downloads);
    }
    return [...grouped].map(([version, downloads]) => ({ version, downloads })).sort((a, b) => b.version.localeCompare(a.version, 'en', { numeric: true }));
  }
  function observations(history) {
    if (history.schemaVersion !== 1 || !Array.isArray(history.snapshots)) throw new Error('Invalid history');
    const dates = new Set();
    return history.snapshots.map(row => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || dates.has(row.date) || !Number.isSafeInteger(row.totalDownloads) || row.totalDownloads < 0) throw new Error('Invalid observation');
      dates.add(row.date);
      versions(row);
      if (row.assets.reduce((sum, asset) => sum + asset.downloads, 0) !== row.totalDownloads) throw new Error('Inconsistent total');
      return row;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }
  const api = { versions, observations };
  if (typeof module !== 'undefined') module.exports = api;
  else root.SpesaInsights = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
