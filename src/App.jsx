import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons.jsx';
import { AI_MESSAGES, AISelector, ClassicWheel, WaterWheel } from './Selectors.jsx';
import { SoundEngine } from './audio.js';
import { COLORS, MAX_LABEL_LENGTH, MAX_OPTIONS, SAMPLE_LABELS, STORAGE_KEY, makeOptions, mergeLabels, nextRotation, parseOptions, randomIndex, validateSavedList } from './logic.js';

const THEMES = [
  { id: 'classic', name: 'Classic wheel', icon: 'wheel', caption: 'A timeless spin on making up your mind.' },
  { id: 'water', name: 'Water wheel', icon: 'water', caption: 'A little water. A little luck. An honest day’s choosing.' },
  { id: 'ai', name: 'AI assistant', icon: 'sparkles', caption: 'Big assistant energy. Absolutely no actual intelligence.' },
];

function loadInitial() {
  let saved;
  let warning = '';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      saved = JSON.parse(raw);
      if (!validateSavedList(saved)) { saved = null; warning = 'The saved list was unreadable. Sample options have been loaded.'; }
    }
  } catch { warning = 'Browser storage is unavailable. Copy or export your list to keep it.'; }
  return {
    options: saved ? validateSavedList(saved) : makeOptions(SAMPLE_LABELS),
    theme: THEMES.some(theme => theme.id === saved?.theme) ? saved.theme : 'classic',
    sound: typeof saved?.sound === 'boolean' ? saved.sound : true,
    allowDuplicates: saved?.allowDuplicates === true,
    motionPreference: ['system', 'full', 'reduced'].includes(saved?.motionPreference) ? saved.motionPreference : 'full',
    warning,
  };
}

export default function App() {
  const [initial] = useState(loadInitial);
  const [options, setOptions] = useState(initial.options);
  const [theme, setTheme] = useState(initial.theme);
  const [sound, setSound] = useState(initial.sound);
  const [allowDuplicates, setAllowDuplicates] = useState(initial.allowDuplicates);
  const [input, setInput] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [duration, setDuration] = useState(0);
  const [result, setResult] = useState(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [messageOffset, setMessageOffset] = useState(0);
  const [toast, setToast] = useState(null);
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const [motionPreference, setMotionPreference] = useState(initial.motionPreference);
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [spinReducedMotion, setSpinReducedMotion] = useState(false);
  const prefersReducedMotion = motionPreference === 'reduced' || (motionPreference === 'system' && systemReducedMotion);
  // Keep a running selection consistent if the system preference changes mid-spin.
  const reducedMotion = spinning ? spinReducedMotion : prefersReducedMotion;
  const audio = useRef(null);
  const timer = useRef(null);
  const aiTimer = useRef(null);
  const toastTimer = useRef(null);
  const running = useRef(false);
  const runId = useRef(0);
  const soundEnabled = useRef(sound);
  const importInput = useRef(null);
  const textarea = useRef(null);
  const graphic = useRef(null);
  const mounted = useRef(true);
  const busy = spinning || importing;
  const currentTheme = THEMES.find(item => item.id === theme);

  useEffect(() => {
    mounted.current = true;
    audio.current = new SoundEngine();
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = event => setSystemReducedMotion(event.matches);
    preference.addEventListener('change', onChange);
    return () => {
      mounted.current = false;
      runId.current++;
      clearTimeout(timer.current);
      clearInterval(aiTimer.current);
      clearTimeout(toastTimer.current);
      preference.removeEventListener('change', onChange);
      audio.current?.dispose();
      audio.current = null;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, options, theme, sound, allowDuplicates, motionPreference }));
    } catch { setStorageWarning('Browser storage is unavailable. Copy or export your list to keep it.'); }
  }, [options, theme, sound, allowDuplicates, motionPreference]);

  function notify(message, undo = null) {
    clearTimeout(toastTimer.current);
    setToast({ message, undo });
    toastTimer.current = setTimeout(() => setToast(null), undo ? 10000 : 4500);
  }

  function updateOptions(next) {
    if (running.current) return;
    setOptions(next);
    setResult(null);
    setDuration(0);
    setRotation(0);
  }

  function addOptions(raw = input) {
    if (running.current) return;
    const parsed = parseOptions(raw);
    if (!parsed.length) { notify('Add a word or phrase first.'); return; }
    if (parsed.some(label => label.length > MAX_LABEL_LENGTH)) { notify(`Keep each option to ${MAX_LABEL_LENGTH} characters or fewer.`); return; }
    const additions = mergeLabels(options.map(option => option.label), parsed, allowDuplicates);
    if (options.length + additions.length > MAX_OPTIONS) { notify(`There’s room for ${MAX_OPTIONS} options. This batch would exceed that limit.`); return; }
    if (!additions.length) { notify('These options are already on your list. Enable duplicates to add them again.'); return; }
    updateOptions([...options, ...makeOptions(additions)]);
    setInput('');
    const skipped = parsed.length - additions.length;
    notify(`${additions.length} option${additions.length === 1 ? '' : 's'} added${skipped ? ` · ${skipped} duplicate${skipped === 1 ? '' : 's'} skipped` : ''}.`);
    textarea.current?.focus();
  }

  function changeTheme(next) {
    if (running.current) return;
    setTheme(next);
    setResult(null);
    setDuration(0);
    setRotation(0);
  }

  function toggleSound() {
    const enabled = !sound;
    soundEnabled.current = enabled;
    setSound(enabled);
    if (!enabled) audio.current?.stop();
    else audio.current?.unlock().catch(() => notify('Audio is unavailable in this browser. You can still spin.'));
  }

  function spin() {
    if (running.current || importing || !options.length) return;
    let selected;
    try { selected = options[randomIndex(options.length)]; }
    catch { notify('Secure randomness is unavailable. Please use a modern browser on localhost or HTTPS.'); return; }
    const index = options.findIndex(option => option.id === selected.id);
    const runDuration = reducedMotion ? 450 : theme === 'water' ? 6200 : 5000;
    const id = ++runId.current;
    running.current = true;
    setSpinReducedMotion(reducedMotion);
    setSpinning(true);
    setResult(null);
    setResultVisible(false);
    setDuration(runDuration);
    setRotation(nextRotation(rotation, index, options.length));
    setAiStep(0);
    setMessageOffset(randomIndex(AI_MESSAGES.length));
    if (theme === 'ai') aiTimer.current = setInterval(() => setAiStep(step => step + 1), 190);
    if (soundEnabled.current) {
      const engine = audio.current;
      engine?.unlock().then(available => {
        if (available && id === runId.current && running.current && soundEnabled.current) engine.start(theme, runDuration);
      }).catch(() => notify('Audio is unavailable in this browser. The selector still works.'));
    }
    timer.current = setTimeout(() => {
      running.current = false;
      clearInterval(aiTimer.current);
      setSpinning(false);
      setResult(selected);
      setResultVisible(true);
      if (soundEnabled.current) audio.current?.finish(theme);
    }, runDuration);
  }

  function dismissResult() {
    setResultVisible(false);
    graphic.current?.querySelector('button')?.focus();
  }

  async function copyList() {
    const text = options.map(option => option.label).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      notify('List copied. Paste it back any time.');
    } catch {
      setInput(text);
      textarea.current?.focus();
      textarea.current?.select();
      notify('Clipboard access is unavailable. Your list is selected in the input; press Ctrl/Cmd+C to copy.');
    }
  }

  function exportList() {
    const url = URL.createObjectURL(new Blob([options.map(option => option.label).join('\n')], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'my-wheel-options.txt';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    notify('List exported as a text file.');
  }

  async function importList(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || running.current) return;
    if (file.size > 250000) { notify('Please use a text file smaller than 250 KB.'); return; }
    setImporting(true);
    try {
      const labels = parseOptions(await file.text());
      if (!mounted.current) return;
      if (!labels.length) { notify('This file has no options to import.'); return; }
      if (labels.length > MAX_OPTIONS || labels.some(label => label.length > MAX_LABEL_LENGTH)) {
        notify(`Use up to ${MAX_OPTIONS} options, each ${MAX_LABEL_LENGTH} characters or fewer.`); return;
      }
      const previous = options;
      // Import restores an exported list exactly, including intentional duplicates.
      updateOptions(makeOptions(labels));
      notify(`${labels.length} options imported. Your previous list was replaced.`, () => updateOptions(previous));
    } catch { if (mounted.current) notify('This file couldn’t be read. Try pasting its contents instead.'); }
    finally { if (mounted.current) setImporting(false); }
  }

  function removeOption(option) {
    const previous = options;
    updateOptions(options.filter(item => item.id !== option.id));
    notify(`Removed “${option.label}”.`, () => updateOptions(previous));
  }

  function clearList() {
    const previous = options;
    updateOptions([]);
    notify('List cleared. A fresh start awaits.', () => updateOptions(previous));
  }

  return <div className="app-shell" data-motion={reducedMotion ? 'reduced' : 'full'}>
    <header className="app-header flex items-center justify-between gap-4">
      <a className="brand flex items-center gap-3" href="./" aria-label="Not a Sentient Wheel home"><span className="brand-mark"><img src={`${import.meta.env.BASE_URL}brand-icon.png`} width="46" height="46" alt="" /></span><span className="brand-name">not a sentient<span>wheel<span className="brand-period">.</span></span></span></a>
      <span className="header-tagline">Less overthinking. More possibility.</span>
      <div className="header-actions flex items-center gap-4"><label className="motion-control flex items-center gap-2"><span>Motion</span><select aria-label="Animation preference" value={motionPreference} onChange={event => setMotionPreference(event.target.value)} disabled={busy} title={`Your system requests ${systemReducedMotion ? 'reduced motion' : 'full animations'}. Choose Full animation to override it.`}><option value="system">Follow system</option><option value="full">Full animation</option><option value="reduced">Reduced motion</option></select></label><button className="sound-button flex items-center gap-2" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? 'Mute sound effects' : 'Enable sound effects'}><Icon name={sound ? 'sound' : 'muted'} size={18} /><span>Sound {sound ? 'on' : 'off'}</span></button></div>
    </header>

    <main className="workspace">
      <aside className="options-panel">
        <div className="panel-heading flex items-center justify-between"><h1>Your possibilities</h1><span className="count-badge">{options.length}</span></div>

        <label htmlFor="options-input" className="field-label">Add your options</label>
        <textarea ref={textarea} id="options-input" placeholder={'Coffee break\nGo for a walk\nOr anything, really…'} value={input} onChange={event => setInput(event.target.value)} disabled={busy} onKeyDown={event => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); addOptions(); } }} aria-describedby="input-help" />
        <p id="input-help" className="input-help">One per line, or separated by commas.</p>
        <div className="flex items-center justify-between gap-2 duplicate-row"><label className="checkbox-label flex items-center gap-2"><input type="checkbox" checked={allowDuplicates} onChange={event => setAllowDuplicates(event.target.checked)} disabled={busy} />Allow duplicates</label><span className="keyboard-shortcut" title="Control or Command plus Enter to add">⌘ / Ctrl ↵</span></div>
        <button className="add-button flex items-center justify-center gap-2" onClick={() => addOptions()} disabled={busy || !input.trim()}><Icon name="plus" size={18} />Add to the wheel</button>

        <div className="list-heading flex items-center justify-between"><h2>ON THE WHEEL <span>{options.length}</span></h2><button onClick={clearList} disabled={busy || !options.length} className="text-button">Clear all</button></div>
        <div className="option-list" role="list" aria-label="Options on the wheel" aria-busy={busy}>
          {options.map((option, index) => <div className="option-row flex items-center gap-3" role="listitem" key={option.id}><span className="option-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="option-label" title={option.label}>{option.label}</span><button className="delete-button" onClick={() => removeOption(option)} disabled={busy} aria-label={`Delete ${option.label}`}><Icon name="close" size={15} /></button></div>)}
          {!options.length && <div className="empty-list"><Icon name="leaf" size={28} /><p>A world of possibilities.<br />An empty list, for now.</p><button className="text-button" onClick={() => updateOptions(makeOptions(SAMPLE_LABELS))} disabled={busy}>Try an example list <span aria-hidden="true">↗</span></button></div>}
        </div>

        <div className="list-tools"><div className="flex gap-2"><button onClick={copyList} disabled={!options.length || busy} className="utility-button flex items-center justify-center gap-2"><Icon name="copy" size={15} />Copy list</button><button onClick={exportList} disabled={!options.length} className="utility-button flex items-center justify-center gap-2"><Icon name="download" size={15} />Export</button></div><button onClick={() => importInput.current?.click()} disabled={busy} className="import-button flex items-center justify-center gap-2" aria-label="Import a previous list" title="Import a previous list from a text file"><Icon name="upload" size={15} />Import</button><input className="sr-only" ref={importInput} type="file" accept=".txt,.csv,text/plain,text/csv" onChange={importList} tabIndex={-1} aria-label="Import options text file" /><p className="import-help">Import replaces the list. Paste to append.</p></div>
        <div className={`storage-note flex items-start gap-2 ${storageWarning ? 'storage-error' : ''}`}><Icon name="shield" size={17} /><p>{storageWarning || <>Saved in this browser.<br />{' '}Your lists stay yours. No accounts, no links.</>}</p></div>
      </aside>

      <section className={`selector-panel theme-${theme}`} aria-label="Random selector">
        <div className="theme-tabs flex" role="group" aria-label="Selector style">{THEMES.map(item => <button key={item.id} onClick={() => changeTheme(item.id)} disabled={busy} aria-pressed={theme === item.id} className={`theme-tab flex items-center justify-center gap-2 ${theme === item.id ? 'active' : ''}`}><Icon name={item.icon} size={17} />{item.name}{item.id === 'ai' && <span className="new-badge">ISH</span>}</button>)}</div>

        <div className="selection-stage">
          <div className="stage-grid" /><div className="ambient-blob blob-one" /><div className="ambient-blob blob-two" />
          <div className="stage-top flex items-center justify-between"><span className="stage-caption"><span className="status-dot" />{theme === 'classic' ? 'THE ORIGINAL CHANCE MACHINE' : theme === 'water' ? 'POWERED BY WATER & WHIMSY' : 'YOUR VERY ARTIFICIAL ASSISTANT'}</span><span className="odds-badge">{options.length ? `${options.length} option${options.length === 1 ? '' : 's'} · equal chances` : 'Ready for possibilities'}</span></div>
          <div className="graphic-wrap" ref={graphic}>
            {theme === 'classic' && <ClassicWheel options={options} rotation={rotation} spinning={spinning} duration={duration} onSpin={spin} />}
            {theme === 'water' && <WaterWheel options={options} rotation={rotation} spinning={spinning} duration={duration} result={result} onSpin={spin} />}
            {theme === 'ai' && <AISelector options={options} spinning={spinning} result={result} aiStep={aiStep} messageOffset={messageOffset} onSpin={spin} />}
            {result && resultVisible && <div className="result-overlay">
              <div className="result-card" role="group" aria-label="Selection result" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); dismissResult(); } }}>
                <button className="result-close" onClick={dismissResult} aria-label="Dismiss result"><Icon name="close" size={16} /></button>
                <span className="result-icon" aria-hidden="true"><Icon name="sparkles" size={23} /></span>
                <p className="result-kicker">THE UNIVERSE HAS SPOKEN</p>
                <p className="result-text">{result.label}</p>
                <span className="chosen-badge">The chosen one <Icon name="check" size={14} /></span>
                <button className="result-again inline-flex items-center justify-center gap-2" onClick={spin} disabled={busy}><Icon name="refresh" size={15} />Spin again</button>
              </div>
            </div>}
          </div>
        </div>

        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{spinning ? 'Letting chance decide…' : result ? `The chosen one: ${result.label}` : ''}</p>
        <p className="theme-caption">{currentTheme.caption}</p>
      </section>
    </main>
    <footer className="app-footer flex items-center justify-between"><span>A little chance can change your day.</span><span>Made for indecisive humans <span className="footer-star">✳</span></span></footer>
    {toast && <div className="toast flex items-center gap-3" role="status"><Icon name="check" size={18} /><span>{toast.message}</span>{toast.undo && <button disabled={busy} onClick={() => { toast.undo(); setToast(null); }}>Undo</button>}<button className="toast-close" aria-label="Dismiss notification" onClick={() => setToast(null)}><Icon name="close" size={16} /></button></div>}
  </div>;
}
