const { test } = require('node:test');
const assert = require('node:assert/strict');
const { versions, observations } = require('../assets/insights-model.js');
const observation = (date, downloads, id = 1) => ({ date, totalDownloads: downloads, assets: [{ id, version: 'v1.3.2', downloads }] });
test('groups multiple APKs of one release and sorts versions numerically', () => {
  assert.deepEqual(versions({ assets: [{ version: 'v1.2.0', downloads: 4 }, { version: 'v1.10.0', downloads: 2 }, { version: 'v1.2.0', downloads: 1 }] }), [{ version: 'v1.10.0', downloads: 2 }, { version: 'v1.2.0', downloads: 5 }]);
});
test('keeps a single baseline; neither fills missing dates nor hides asset deletion', () => {
  assert.equal(observations({ schemaVersion: 1, snapshots: [observation('2026-11-05', 20)] }).length, 1);
  const rows = observations({ schemaVersion: 1, snapshots: [observation('2026-11-08', 3, 2), observation('2026-11-05', 20)] });
  assert.deepEqual(rows.map(row => row.totalDownloads), [20, 3]);
  assert.equal(rows.length, 2);
});
test('rejects inconsistent totals and duplicate dates', () => {
  assert.throws(() => observations({ schemaVersion: 1, snapshots: [{ ...observation('2026-11-05', 20), totalDownloads: 21 }] }));
  assert.throws(() => observations({ schemaVersion: 1, snapshots: [observation('2026-11-05', 20), observation('2026-11-05', 21)] }));
});
