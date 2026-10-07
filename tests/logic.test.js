import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_OPTIONS, fitLabel, makeOptions, mergeLabels, nextRotation, parseOptions, randomIndex, slicePath, validateSavedList } from '../src/logic.js';

test('pasted lists accept commas, LF, CRLF, phrases, and empty separators', () => {
  assert.deepEqual(parseOptions(' Coffee break,Go for a walk\r\n\n Read a book, ,Take a nap\rSurprise me '), ['Coffee break', 'Go for a walk', 'Read a book', 'Take a nap', 'Surprise me']);
  assert.deepEqual(parseOptions(' ,\n\r '), []);
});

test('difference mode skips existing labels and duplicates within a batch, ignoring case', () => {
  assert.deepEqual(mergeLabels(['Coffee'], ['coffee', 'Tea', 'TEA', 'Cake'], false), ['Tea', 'Cake']);
  assert.deepEqual(mergeLabels(['Coffee'], ['coffee', 'Tea', 'TEA'], true), ['coffee', 'Tea', 'TEA']);
});

test('identical options have separate identities and can be removed independently', () => {
  const options = makeOptions(['Tea', 'Tea']);
  assert.notEqual(options[0].id, options[1].id);
  assert.equal(options.filter(option => option.id !== options[0].id).length, 1);
});

test('rejection sampling removes modulo bias and respects bounds', () => {
  const values = [0xffffffff, 0xfffffffe, 7];
  assert.equal(randomIndex(3, () => values.shift()), 2);
  assert.equal(values.length, 1);
  for (let count = 1; count <= MAX_OPTIONS; count++) {
    assert.equal(randomIndex(count, () => 0), 0);
    assert.equal(randomIndex(count, () => count - 1), count - 1);
  }
  for (const invalid of [0, -1, 1.2, 501]) assert.throws(() => randomIndex(invalid), RangeError);
});

test('every selected segment finishes upright at the right-hand pointer, across successive spins', () => {
  let rotation = 0;
  for (const count of [1, 2, 3, 8, 17, 120, 500]) {
    for (let index = 0; index < count; index++) {
      const next = nextRotation(rotation, index, count);
      assert.ok(next - rotation >= 1800);
      assert.ok(next - rotation < 2160.000001);
      const angle = (next + index * 360 / count) % 360;
      assert.ok(Math.min(angle, 360 - angle) < 0.000001);
      rotation = next;
    }
  }
});

test('wheel geometry handles a single option and never outputs invalid coordinates', () => {
  assert.equal(slicePath(0, 1), null);
  assert.match(slicePath(0, 2), /^M300,300 L/);
  assert.ok(!slicePath(499, 500).includes('NaN'));
});

test('storage preserves an intentionally empty list, duplicate labels, and validated record IDs', () => {
  assert.deepEqual(validateSavedList({ version: 1, options: [] }), []);
  const options = makeOptions(['Tea', 'Tea']);
  assert.deepEqual(validateSavedList({ version: 1, options }), options);
  const invalid = [null, {}, { version: 2, options: [] }, { version: 1, options: [{ id: 'a', label: ' ' }] }, { version: 1, options: [{ id: 'a', label: 'a,b' }] }, { version: 1, options: [{ id: 'a', label: 'Tea' }, { id: 'a', label: 'Cake' }] }, { version: 1, options: [{ id: 'a', label: 'x'.repeat(201) }] }, { version: 1, options: Array(501).fill(options[0]) }];
  invalid.forEach(value => assert.equal(validateSavedList(value), null));
});

test('plain-text export can restore labels including deliberate duplicates', () => {
  const options = makeOptions(['Crème brûlée', 'Read a book', 'Read a book', '🍕 Pizza']);
  assert.deepEqual(parseOptions(options.map(option => option.label).join('\n')), options.map(option => option.label));
});

test('wheel labels fit their radial space and truncate without breaking Unicode code points', () => {
  const measure = text => Array.from(text).length * 10;
  assert.equal(fitLabel('Tea', measure, 50), 'Tea');
  assert.equal(fitLabel('A long possibility', measure, 50), 'A lo…');
  assert.equal(fitLabel('🍕🍕🍕🍕🍕🍕', measure, 50), '🍕🍕🍕🍕…');
});
