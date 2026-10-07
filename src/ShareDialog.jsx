import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons.jsx';

export function ShareDialog({ url, onClose }) {
  const dialog = useRef(null);
  const field = useRef(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    field.current?.select();
    return () => { if (element.open) element.close(); };
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('Link copied.');
    } catch {
      field.current?.select();
      setStatus('The link is selected. Press Ctrl/Cmd+C to copy it.');
    }
  }

  return <dialog ref={dialog} className="share-dialog" aria-labelledby="share-heading" onClose={event => { if (!event.currentTarget.open) onClose(); }}>
    <form method="dialog" className="share-heading flex items-center justify-between gap-4"><h2 id="share-heading">Share your possibilities</h2><button aria-label="Close share window" className="share-close"><Icon name="close" size={18} /></button></form>
    <p>Anyone with this link can open a copy of your list. Later edits won’t change this link.</p>
    <label htmlFor="share-link">Your share link</label>
    <textarea id="share-link" ref={field} readOnly value={url} onFocus={event => event.target.select()} />
    <button className="share-copy inline-flex items-center justify-center gap-2" onClick={copyLink}><Icon name="copy" size={17} />Copy link</button>
    <p className="share-copy-status" role="status" aria-live="polite">{status}</p>
  </dialog>;
}
