export const STORAGE_KEY = 'not-a-sentient-wheel:v1';
export const MAX_OPTIONS = 500;
export const MAX_LABEL_LENGTH = 200;
export const SAMPLE_LABELS = ['Coffee break', 'Go for a walk', 'One more episode', 'Read a book', 'Order pizza', 'Do the thing', 'Take a nap', 'Surprise me'];
export const COLORS = ['#cde4a4', '#fae0a0', '#c8dfdf', '#e5d4ec', '#f6c9b5', '#d4deae', '#c9dfeb', '#f0d6a9'];

export function parseOptions(input) {
  return input.split(/[,\r\n]+/).map(label => label.trim()).filter(Boolean);
}

export function mergeLabels(existing, incoming, allowDuplicates) {
  if (allowDuplicates) return incoming;
  const seen = new Set(existing.map(label => label.toLocaleLowerCase('en')));
  return incoming.filter(label => {
    const key = label.toLocaleLowerCase('en');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function makeOptions(labels) {
  return labels.map(label => ({ id: crypto.randomUUID(), label }));
}

export function validateSavedList(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.options) || value.options.length > MAX_OPTIONS) return null;
  const ids = new Set();
  for (const option of value.options) {
    if (!option || typeof option.id !== 'string' || !option.id || ids.has(option.id) || typeof option.label !== 'string' || !option.label.trim() || option.label.length > MAX_LABEL_LENGTH || /[,\r\n]/.test(option.label)) return null;
    ids.add(option.id);
  }
  return value.options.map(({ id, label }) => ({ id, label: label.trim() }));
}

// Reject the incomplete range at the end of uint32 so every option is equally likely.
export function randomIndex(count, nextUint32 = () => crypto.getRandomValues(new Uint32Array(1))[0]) {
  if (!Number.isInteger(count) || count < 1 || count > MAX_OPTIONS) throw new RangeError('Invalid option count');
  const limit = Math.floor(0x100000000 / count) * count;
  let value;
  do { value = nextUint32(); } while (value >= limit);
  return value % count;
}

export function randomStartingRotation(count, nextUint32) {
  if (count === 0) return 0;
  return randomIndex(count, nextUint32) * 360 / count;
}

export function nextRotation(current, index, count) {
  const target = ((-index * 360 / count) % 360 + 360) % 360;
  const normalized = ((current % 360) + 360) % 360;
  return current + 5 * 360 + ((target - normalized + 360) % 360);
}

export function slicePath(index, count, radius = 220) {
  if (count === 1) return null;
  const step = 2 * Math.PI / count;
  const start = index * step - step / 2;
  const end = start + step;
  const point = angle => `${300 + radius * Math.cos(angle)},${300 + radius * Math.sin(angle)}`;
  return `M300,300 L${point(start)} A${radius},${radius} 0 ${step > Math.PI ? 1 : 0} 1 ${point(end)} Z`;
}

export function shortenLabel(label, max = 20) {
  const characters = Array.from(label);
  return characters.length > max ? `${characters.slice(0, max - 1).join('')}…` : label;
}

export function fitLabel(label, measure, maxWidth = 130) {
  if (measure(label) <= maxWidth) return label;
  const characters = Array.from(label);
  let low = 0;
  let high = characters.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (measure(`${characters.slice(0, middle).join('')}…`) <= maxWidth) low = middle;
    else high = middle - 1;
  }
  return `${characters.slice(0, low).join('')}…`;
}
