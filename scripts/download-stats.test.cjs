const { test } = require('node:test');
const assert = require('node:assert/strict');
const { snapshot, appendSnapshot, csv, fetchReleases } = require('./download-stats.cjs');
const apk = (id, downloads, name = 'SpesaFacile.apk') => ({ id, download_count: downloads, name, state: 'uploaded' });
const release = (assets, extra = {}) => ({ tag_name: 'v1.3.2', assets, ...extra });

test('counts APK assets only, excluding checksums, drafts and prereleases', () => {
  const result = snapshot([
    release([apk(1, 23), apk(2, 10, 'SHA256SUMS.txt')]),
    release([apk(3, 999)], { draft: true }), release([apk(4, 999)], { prerelease: true }),
    release([apk(5, 7)], { tag_name: 'v1.3.1' })
  ]);
  assert.equal(result.totalDownloads, 30);
  assert.deepEqual(result.assets.map(a => a.id), [1, 5]);
});

test('refuses malformed counts and duplicate assets instead of publishing partial totals', () => {
  for (const count of [-1, undefined, 1.5]) assert.throws(() => snapshot([release([apk(1, count)])]));
  assert.throws(() => snapshot([release([apk(1, 3), apk(1, 3)])]));
});

test('keeps historical days and asset IDs when a release asset is replaced', () => {
  const first = snapshot([release([apk(1, 20)])], new Date('2026-11-05T06:00:00Z'));
  const next = snapshot([release([apk(2, 2)])], new Date('2026-11-06T06:00:00Z'));
  let history = appendSnapshot({ schemaVersion: 1, repository: 'CosmoNetinfo/SpesaFacile', snapshots: [] }, first);
  history = appendSnapshot(history, next);
  history = appendSnapshot(history, { ...next, totalDownloads: 3, assets: [{ ...next.assets[0], downloads: 3 }] });
  assert.equal(history.snapshots.length, 2);
  assert.equal(history.snapshots[0].assets[0].downloads, 20);
  assert.equal(history.snapshots[1].assets[0].id, 2);
  assert.equal(history.snapshots[1].totalDownloads, 3);
  assert.match(csv(history), /"2026-11-05".*"20"/);
});

test('fetches all release pages and fails on a later page error', async () => {
  let calls = 0;
  const releases = await fetchReleases(async () => ({ ok: true, json: async () => ++calls === 1 ? Array(100).fill(release([])) : [release([])] }));
  assert.equal(calls, 2);
  assert.equal(releases.length, 101);
  calls = 0;
  await assert.rejects(fetchReleases(async () => ++calls === 1
    ? { ok: true, json: async () => Array(100).fill(release([])) }
    : { ok: false, status: 503 }), /503/);
});
