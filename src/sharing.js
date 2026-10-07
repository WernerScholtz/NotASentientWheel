import { MAX_LABEL_LENGTH, MAX_OPTIONS } from './logic.js';

export const MAX_SHARE_URL_LENGTH = 8000;
export const MAX_SHARED_JSON_BYTES = 512000;
const PREFIX = '#list=';

export function hasSharedList(hash) {
  return hash.startsWith(PREFIX);
}

function validateLabels(labels) {
  if (!Array.isArray(labels) || !labels.length || labels.length > MAX_OPTIONS || labels.some(label =>
    typeof label !== 'string' || !label.trim() || label !== label.trim() || label.length > MAX_LABEL_LENGTH || /[,\r\n]/.test(label))) {
    throw new Error('This shared list contains invalid options.');
  }
  return labels;
}

function base64Url(bytes) {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export async function createShareLink(labels, pageUrl) {
  validateLabels(labels);
  if (typeof CompressionStream !== 'function') throw new Error('Sharing needs a browser with compression support. Try a current browser, or export your list.');
  const json = JSON.stringify(labels);
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  const url = new URL(pageUrl);
  url.hash = `${PREFIX}v1.${base64Url(compressed)}`;
  if (url.href.length > MAX_SHARE_URL_LENGTH) throw new Error('This list makes a link that is too long. Share fewer options, or export the list instead.');
  return url.href;
}

// Bound decompression before parsing so a small, untrusted link cannot expand
// into an arbitrarily large allocation. Labels are validated before use.
export async function readSharedList(hash) {
  if (!hasSharedList(hash)) return null;
  if (hash.length > MAX_SHARE_URL_LENGTH) throw new Error('This shared link is too long.');
  const match = /^#list=v1\.([A-Za-z0-9_-]+)$/.exec(hash);
  if (!match) throw new Error('This shared link is invalid or uses an unsupported version.');
  if (typeof DecompressionStream !== 'function') throw new Error('Opening a shared list needs a browser with compression support. Try a current browser.');

  let reader;
  try {
    const encoded = match[1];
    const padded = encoded.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - encoded.length % 4) % 4);
    const bytes = Uint8Array.from(atob(padded), character => character.charCodeAt(0));
    if (base64Url(bytes) !== encoded) throw new Error('Invalid encoding');
    reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_SHARED_JSON_BYTES) {
        await reader.cancel().catch(() => {});
        throw new Error('Decoded list is too large');
      }
      chunks.push(value);
    }
    const jsonBytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { jsonBytes.set(chunk, offset); offset += chunk.length; }
    const json = new TextDecoder('utf-8', { fatal: true }).decode(jsonBytes);
    return validateLabels(JSON.parse(json));
  } catch {
    throw new Error('This shared link is damaged or contains an invalid list. Your existing list was kept.');
  } finally {
    reader?.releaseLock();
  }
}

export function clearSharedListHash() {
  if (!hasSharedList(window.location.hash)) return;
  const url = new URL(window.location.href);
  url.hash = '';
  window.history.replaceState(window.history.state, '', url.href);
}
