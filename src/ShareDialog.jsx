import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons.jsx';

export function ShareDialog({ url, onClose }) {
  const dialog = useRef(null);
  const field = useRef(null);
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    field.current?.select();
    return () => { if (element.open) element.close(); };
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setStatus('Link copied to your clipboard.');
    } catch {
      field.current?.select();
      setCopied(false);
      setStatus('The link is selected. Press Ctrl/Cmd+C to copy it.');
    }
  }

  return <dialog ref={dialog} className="share-dialog" aria-labelledby="share-heading" onClose={event => { if (!event.currentTarget.open) onClose(); }}>
    <form method="dialog" className="share-heading flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="share-badge-icon" aria-hidden="true"><Icon name="link" size={18} /></span>
        <h2 id="share-heading">Share your possibilities</h2>
      </div>
      <button aria-label="Close share window" className="share-close"><Icon name="close" size={18} /></button>
    </form>
    <p className="share-lead">Anyone with this link can open a snapshot of your list. Later edits won’t change this link, and nothing is sent to a server.</p>
    <label htmlFor="share-link" className="share-field-label">Shareable snapshot URL</label>
    <textarea id="share-link" ref={field} readOnly value={url} onFocus={event => event.target.select()} />
    <div className="share-actions flex items-center gap-3">
      <button type="button" className={`share-copy inline-flex items-center justify-center gap-2 ${copied ? 'is-copied' : ''}`} onClick={copyLink}>
        <Icon name={copied ? 'check' : 'copy'} size={17} />
        <span>{copied ? 'Link copied' : 'Copy link'}</span>
      </button>
    </div>
    <p className="share-copy-status" role="status" aria-live="polite">{status}</p>
  </dialog>;
}
