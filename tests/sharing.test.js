import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync, gunzipSync } from 'node:zlib';
import { createShareLink, hasSharedList, MAX_SHARED_JSON_BYTES, MAX_SHARE_URL_LENGTH, readSharedList } from '../src/sharing.js';
import { makeOptions } from '../src/logic.js';

const names = Array.from({ length: 20 }, (_, index) => `Firstname Lastname${index + 1}`);
const baseUrl = 'https://wernerscholtz.github.io/NotASentientWheel/';
const externalHash = value => `#list=v1.${gzipSync(JSON.stringify(value)).toString('base64url')}`;

test('a compressed URL reconstructs 20 first names and surnames in their original order', async () => {
  const link = await createShareLink(names, baseUrl);
  const url = new URL(link);
  assert.equal(url.origin + url.pathname, baseUrl);
  assert.match(url.hash, /^#list=v1\.[A-Za-z0-9_-]+$/);
  assert.deepEqual(await readSharedList(url.hash), names);
  assert.ok(link.length < 500, `Twenty names produced a ${link.length}-character link`);
  // Verify the format independently of the app's decoder.
  const compressed = Buffer.from(url.hash.slice('#list=v1.'.length), 'base64url');
  assert.deepEqual(JSON.parse(gunzipSync(compressed).toString('utf8')), names);
  assert.ok(compressed.length < Buffer.byteLength(JSON.stringify(names)));
});

test('the decoder reconstructs a 20-name fixture compressed independently with Node gzip', async () => {
  assert.deepEqual(await readSharedList(externalHash(names)), names);
});

test('spaces, punctuation, Unicode and duplicates survive sharing as separate options', async () => {
  const labels = ['Mary Jane Watson', "Siobhán O’Connor", 'Jean-Luc Picard', '李 小龙', '🍕 Pizza night', 'A & B / #1 + 2 = fun', 'First  Last', 'Firstname Lastname1', 'Firstname Lastname1'];
  const link = await createShareLink(labels, baseUrl);
  const restored = await readSharedList(new URL(link).hash);
  assert.deepEqual(restored, labels);
  const options = makeOptions(restored);
  assert.equal(new Set(options.map(option => option.id)).size, labels.length);
  assert.equal(options.at(-1).label, options.at(-2).label);
});

test('share links retain a GitHub Pages subpath and replace an existing fragment', async () => {
  const link = new URL(await createShareLink(names, `${baseUrl}?view=wheel#old-fragment`));
  assert.equal(link.pathname, '/NotASentientWheel/');
  assert.equal(link.search, '?view=wheel');
  assert.deepEqual(await readSharedList(link.hash), names);
});

test('ordinary URLs do not import a list; malformed and future-format links are rejected', async () => {
  assert.equal(hasSharedList(''), false);
  assert.equal(await readSharedList('#about'), null);
  for (const hash of ['#list=', '#list=v2.abc', '#list=v1.A', '#list=v1.invalid_data', '#list=v1.a+b/c=']) {
    await assert.rejects(readSharedList(hash));
  }
  const bytes = gzipSync(JSON.stringify(names));
  bytes[bytes.length - 5] ^= 0xff;
  await assert.rejects(readSharedList(`#list=v1.${bytes.toString('base64url')}`));
});

test('invalid list data is rejected during both encoding and reconstruction', async () => {
  for (const value of [null, {}, [], [''], [' leading space'], ['a,b'], ['a\nb'], [1], ['x'.repeat(201)], Array(501).fill('Name Surname')]) {
    await assert.rejects(createShareLink(value, baseUrl));
    await assert.rejects(readSharedList(externalHash(value)));
  }
});

test('oversized links and decompressed data are bounded', async () => {
  await assert.rejects(readSharedList(`#list=v1.${'a'.repeat(MAX_SHARE_URL_LENGTH)}`));
  await assert.rejects(readSharedList(externalHash('x'.repeat(MAX_SHARED_JSON_BYTES + 1))));
  await assert.rejects(createShareLink(names, `${baseUrl}?padding=${'x'.repeat(MAX_SHARE_URL_LENGTH)}`), /too long/);
});
