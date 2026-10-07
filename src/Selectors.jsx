import { COLORS, fitLabel, shortenLabel, slicePath } from './logic.js';
import { Icon } from './Icons.jsx';

let measurementContext;
const labelCache = new Map();
function wheelLabel(label, fontSize) {
  const key = `${fontSize}:${label}`;
  if (labelCache.has(key)) return labelCache.get(key);
  measurementContext ||= document.createElement('canvas').getContext('2d');
  if (!measurementContext) return shortenLabel(label, 14);
  measurementContext.font = `600 ${fontSize}px "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
  const fitted = fitLabel(label, text => measurementContext.measureText(text).width);
  // Keep the cache bounded even when many different lists are pasted over time.
  if (labelCache.size > 1000) labelCache.clear();
  labelCache.set(key, fitted);
  return fitted;
}

export const AI_MESSAGES = [
  'Figuring out who to bless with the gift of being the chosen one…',
  'Consulting the council of mildly opinionated algorithms…',
  'Finding a volunteer. Consent of the universe pending…',
  'Calculating the ideal balance of destiny and inconvenience…',
  'Giving every option a very serious imaginary interview…',
  'Searching for someone who looks suspiciously available…',
  'Checking whether the chosen one has other plans…',
  'Reassuring the options that this is a great opportunity…',
  'Preparing a small, completely unnecessary prophecy…',
  'Running a background check on fate. Fate is unavailable…',
  'Promoting one lucky option to main character…',
  'Determining who gets the honour of doing the thing…',
  'Asking the universe nicely. Adding “please” to the prompt…',
  'Locating the option with the strongest “why me?” energy…',
  'Generating a destiny with absolutely no onboarding…',
  'Checking the vibes. The vibes have declined to comment…',
  'Awarding a responsibility nobody explicitly requested…',
  'Making a decision so you can blame the computer…',
  'Turning mild uncertainty into a very confident announcement…',
  'Preparing a congratulatory email nobody will read…',
  'Giving chance a tiny clipboard and a management title…',
  'Finding the chosen one. Benefits package: unspecified…',
  'Matching an unsuspecting option with its moment of glory…',
  'Taking “pick me” energy extremely literally…',
  'Outsourcing the final decision to an imaginary intern…',
  'Doing advanced maths. By advanced, we mean random…',
  'Offering one option a prestigious unpaid destiny…',
  'Drafting an acceptance speech on the winner’s behalf…',
];

function Segments({ options, wooden = false }) {
  const count = options.length;
  if (!count) return <circle cx="300" cy="300" r="220" fill={wooden ? '#b69062' : '#e6ecd9'} />;
  return options.map((option, index) => {
    const fill = wooden ? ['#d9b682', '#b88c58', '#cfaa74', '#c39a64'][index % 4] : COLORS[index % COLORS.length];
    const fontSize = count > 40 ? 6 : count > 24 ? 8 : count > 16 ? 10 : count > 10 ? 12 : 15;
    return <g key={option.id}>
      {count === 1 ? <circle cx="300" cy="300" r="220" fill={fill} /> : <path d={slicePath(index, count)} fill={fill} stroke={wooden ? '#82613b' : '#fcfcf5'} strokeWidth={count > 80 ? 0.4 : 2} />}
      {count <= 120 && <g transform={`rotate(${index * 360 / count} 300 300)`}>
        {wooden && <path d="M375 286q42 8 100 0M379 318q48-9 111-2" fill="none" stroke="#805b38" opacity=".16" strokeWidth="2" />}
        <text x="508" y="300" textAnchor="end" dominantBaseline="middle" fill={wooden ? '#463421' : '#294436'} fontSize={fontSize} fontWeight="600" letterSpacing="-.2">{wheelLabel(option.label, fontSize)}</text>
      </g>}
    </g>;
  });
}

function SpinHub({ wooden = false, spinning, empty }) {
  return <g>
    <circle cx="300" cy="303" r="64" fill="#142e22" opacity=".12" />
    <circle cx="300" cy="300" r="61" fill={wooden ? '#775738' : '#fafbf3'} stroke={wooden ? '#583e29' : '#d8e3c8'} strokeWidth="5" />
    <g transform="translate(288 270)" fill="none" stroke={wooden ? '#ffe4b5' : '#3a5a40'} strokeWidth="1.8" strokeLinecap="round"><path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 14 6M4 12a8 8 0 0 0 14 6" /></g>
    <text x="300" y="318" textAnchor="middle" fill={wooden ? '#ffe4b5' : '#294436'} fontSize="15" fontWeight="700">{empty ? 'ADD OPTIONS' : spinning ? 'SPINNING' : 'SPIN ME'}</text>
    <circle cx="300" cy="300" r="51" fill="none" stroke={wooden ? '#b38b58' : '#e4eadb'} strokeWidth="1" />
  </g>;
}

export function ClassicWheel({ options, rotation, spinning, duration, onSpin }) {
  return <button className="wheel-interactive classic-graphic" onClick={onSpin} disabled={spinning || !options.length} aria-label="Spin the classic wheel">
    <svg viewBox="0 0 600 600" className="wheel-svg" aria-hidden="true">
      <circle cx="300" cy="308" r="246" fill="#3d5a3c" opacity=".07" />
      <circle cx="300" cy="300" r="244" fill="#fcfdf8" stroke="#e4e9d9" strokeWidth="1" />
      {Array.from({ length: 72 }, (_, i) => <path key={i} d={i % 6 === 0 ? 'M300 66v7' : 'M300 68v3'} transform={`rotate(${i * 5} 300 300)`} stroke="#c0cbb2" strokeWidth={i % 6 === 0 ? 2 : 1} />)}
      <g className="rotating-wheel" style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${duration}ms` }}><Segments options={options} /></g>
      <circle cx="300" cy="300" r="221" fill="none" stroke="#e0e7d2" strokeWidth="2" />
      <SpinHub spinning={spinning} empty={!options.length} />
      <g className={spinning ? 'wheel-pointer pointer-ticking' : 'wheel-pointer'}><path d="m562 280-35 20 35 20q7 4 7-5v-30q0-9-7-5" fill="#294c38" /><circle cx="557" cy="300" r="4" fill="#d7e5ac" /></g>
    </svg>
  </button>;
}

function Farmer({ pointing }) {
  return <g className={pointing ? 'farmer farmer-pointing' : 'farmer'} transform="translate(574 408)">
    <ellipse cx="23" cy="151" rx="40" ry="8" fill="#385f48" opacity=".13" />
    <path d="m9 112-4 30m29-30 6 30" stroke="#4b6447" strokeWidth="16" strokeLinecap="round" />
    <path d="M-4 143h15m22 0h16" stroke="#5c4532" strokeWidth="11" strokeLinecap="round" />
    <path d="M3 59q19-10 38 0l5 55H-1Z" fill="#eac593" />
    <path d="M6 57v32h30V57m-37 57 4-32h39l4 32Z" fill="#5c7952" />
    <rect x="12" y="88" width="20" height="15" rx="3" fill="#799466" />
    <circle cx="22" cy="34" r="25" fill="#ecc499" />
    <path d="M-3 29q-3-29 25-29 30 0 25 31l-10-7-14 3-12-3Z" fill="#95714d" />
    <path d="M-14 18h72M2 14 7-8h31l7 22" stroke="#856744" strokeWidth="9" strokeLinecap="round" fill="#c3a46b" />
    <circle cx="14" cy="34" r="2.3" fill="#3d4130" /><circle cx="31" cy="34" r="2.3" fill="#3d4130" />
    <path d="m18 44 6 3 6-3" fill="none" stroke="#95654a" strokeWidth="2" strokeLinecap="round" />
    <path d="m42 65 12 27" stroke="#eac593" strokeWidth="12" strokeLinecap="round" />
    <g className="farmer-arm"><path d="M4 65-14 46-39 40" stroke="#eac593" strokeWidth="12" strokeLinecap="round" fill="none" /><path d="m-37 40-12-4" stroke="#eac593" strokeWidth="6" strokeLinecap="round" /></g>
  </g>;
}

export function WaterWheel({ options, rotation, spinning, duration, result, onSpin }) {
  return <button className={`wheel-interactive water-graphic ${spinning ? 'water-running' : ''}`} onClick={onSpin} disabled={spinning || !options.length} aria-label="Pour water and spin the water wheel">
    <svg viewBox="0 0 700 640" className="wheel-svg" aria-hidden="true">
      <defs>
        <linearGradient id="river" x2="1" y2="0"><stop stopColor="#a9ced0" /><stop offset="1" stopColor="#d5e8e3" /></linearGradient>
        <pattern id="woodGrain" width="60" height="40" patternUnits="userSpaceOnUse"><path d="M0 10q15-5 30 0t30 0M0 30q15 5 30 0t30 0" stroke="#54391f" opacity=".16" fill="none" /></pattern>
      </defs>
      <g fill="#fff" opacity=".65"><path d="M45 77q-6-21 14-24 6-27 30-20 15 2 17 23 27-3 27 21Z" /><path d="M502 109q-5-14 10-17 3-18 21-15 14 0 16 17 19-2 22 15Z" /></g>
      <path d="M0 527q70-90 155-26t124 10q122-106 269-10t152 13v126H0Z" fill="#dbe4b6" />
      <path d="M0 561q182-19 308 0t392-5v84H0Z" fill="url(#river)" />
      <g className="river-ripples" stroke="#f2fbf3" strokeWidth="3" opacity=".7" strokeLinecap="round"><path d="M49 586h56m101 13h82m137-11h75m59 31h66M3 621h116m215-7h62" /></g>
      <path d="m298 286-95 285h194Z" stroke="#796144" strokeWidth="15" fill="#998567" />
      <path d="m298 310-68 242h138Z" fill="#c8d3ba" />
      <circle cx="300" cy="313" r="241" fill="#61472f" opacity=".12" />
      <g className="rotating-wheel water-rotating" style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${Math.max(0, duration - 650)}ms`, transitionDelay: spinning ? '650ms' : '0ms' }}>
        <circle cx="300" cy="300" r="246" fill="#745432" stroke="#543d28" strokeWidth="5" />
        {Array.from({ length: 24 }, (_, i) => <g key={i} transform={`rotate(${i * 15} 300 300)`}><rect x="282" y="48" width="36" height="30" rx="3" fill="#a9814d" stroke="#654827" strokeWidth="3" /><path d="M288 56h24" stroke="#d2ad77" strokeWidth="2" /></g>)}
        <Segments options={options} wooden />
        <circle cx="300" cy="300" r="230" fill="none" stroke="#c5a26a" strokeWidth="16" />
        <circle cx="300" cy="300" r="230" fill="none" stroke="#795a35" strokeWidth="2" />
        <circle cx="300" cy="300" r="244" fill="url(#woodGrain)" />
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx="300" cy="70" r="4" transform={`rotate(${i * 30} 300 300)`} fill="#715839" />)}
      </g>
      <SpinHub wooden spinning={spinning} empty={!options.length} />
      <path d="m552 283-26 17 26 17" fill="#efc263" stroke="#8c6835" strokeWidth="3" strokeLinejoin="round" />
      <g className="water-stream" fill="none" stroke="#82c6cc" strokeLinecap="round"><path d="M537 92q-23 36-20 105" strokeWidth="20" /><path d="M552 100q-24 42-15 99M526 97q-30 40-25 73" strokeWidth="7" /><path d="m513 191-22 25m34-16 7 29m-11-38-8 35" strokeWidth="6" /></g>
      <g className="pouring-bucket" style={{ transformOrigin: '558px 69px' }}>
        <path d="M523 48q0-37 37-37t37 37" fill="none" stroke="#7e7255" strokeWidth="5" />
        <path d="m516 41 12 75q32 14 62 0l12-75Z" fill="#a6aaa0" stroke="#68776c" strokeWidth="4" />
        <ellipse cx="559" cy="41" rx="43" ry="10" fill="#cdd5c4" stroke="#68776c" strokeWidth="4" />
        <path d="M531 55h55M535 100h47" stroke="#d1d5c8" strokeWidth="5" />
        <path d="m541 52 5 51m20-51-2 52m20-51-6 50" stroke="#758279" strokeWidth="2" />
      </g>
      <Farmer pointing={Boolean(result) && !spinning} />
      {result && !spinning && <g className="farmer-bubble"><rect x="524" y="349" width="148" height="36" rx="18" fill="#fcfbeb" stroke="#d8d8b8" /><path d="m599 385 9 12 3-13" fill="#fcfbeb" /><text x="598" y="372" textAnchor="middle" fontSize="13" fill="#586444" fontWeight="600">That’s the one!</text></g>}
      <g fill="#6e8e58"><path d="m82 554-9-26 17 16 5-32 8 31 12-12-5 27ZM650 565l-8-25 15 12 7-28 2 28 12-15-5 29Z" /></g>
    </svg>
  </button>;
}

export function AISelector({ options, spinning, result, aiStep, messageOffset, onSpin }) {
  const candidate = result && !spinning ? result.label : spinning ? options[aiStep % options.length]?.label : 'Your destiny is buffering.';
  const message = AI_MESSAGES[(messageOffset + Math.floor(aiStep / 4)) % AI_MESSAGES.length];
  return <button onClick={onSpin} disabled={spinning || !options.length} aria-label="Run the AI assistant selector" className={`ai-console ${spinning ? 'ai-running' : ''} ${result && !spinning ? 'ai-chosen' : ''}`}>
    <div className="console-top"><div className="flex gap-1.5"><i /><i /><i /></div><span>chance_assistant.exe</span><Icon name="sparkles" size={16} /></div>
    <div className="console-body">
      <div className="console-status"><span className="status-led" />{spinning ? 'ASSISTANT IS OVERTHINKING' : result ? 'DESTINY SUCCESSFULLY ASSIGNED' : 'ASSISTANT IS READY'}</div>
      <div className="ai-orb"><div className="orb-ring ring-one" /><div className="orb-ring ring-two" /><div className="orb-ring ring-three" /><div className="orb-core"><Icon name={result && !spinning ? 'check' : 'sparkles'} size={38} /></div><span className="orb-spark spark-one">+</span><span className="orb-spark spark-two">+</span></div>
      <span className="candidate-label">{spinning ? 'CONTEMPLATING THE CANDIDATES' : result ? 'THE CHOSEN ONE' : 'EXTREMELY ARTIFICIAL. MILDLY INTELLIGENT.'}</span>
      <div className="ai-candidate">{candidate}</div>
      <div className="ai-message">{spinning ? message : result ? 'Congratulations. Your prestigious, possibly inconvenient destiny awaits.' : 'I can make this decision for you. My qualifications? Impeccable randomness.'}</div>
      <div className="console-log"><p><span>01</span> {options.length} candidates loaded. All equally unsuspecting.</p><p><span>02</span> {spinning ? 'Pretending this requires a neural network…' : result ? 'Choice made. Taking absolutely all of the credit.' : 'Awaiting permission to be suspiciously helpful.'}</p><p><span>03</span> {spinning ? <span className="log-active">Applying unnecessary dramatic suspense<span className="cursor">_</span></span> : 'Sentience check: negative. Probably.'}</p></div>
      <div className="console-bottom"><span>NO REAL AI. JUST REAL CHANCE.</span><span>{spinning ? 'PROCESSING' : result ? 'COMPLETE' : 'IDLE'} <span className="console-dot">●</span></span></div>
    </div>
  </button>;
}
