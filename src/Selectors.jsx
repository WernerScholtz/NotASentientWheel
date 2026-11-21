import { COLORS, DARK_COLORS, fitLabel, shortenLabel, slicePath } from './logic.js';
import { Icon } from './Icons.jsx';

let measurementContext;
const labelCache = new Map();
function wheelLabel(label, fontSize) {
  const key = `${fontSize}:${label}`;
  if (labelCache.has(key)) return labelCache.get(key);
  measurementContext ||= document.createElement('canvas').getContext('2d');
  if (!measurementContext) return shortenLabel(label, 14);
  measurementContext.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
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

const WOOD_COLORS = ['#deb984', '#be915b', '#d3ac75', '#c59c65'];

function Segments({ options, wooden = false }) {
  const count = options.length;
  if (!count) return <circle cx="300" cy="300" r="220" fill={wooden ? 'var(--wood-empty, #b69062)' : 'var(--wheel-empty, #e4ead9)'} />;
  const palette = wooden ? WOOD_COLORS : COLORS;
  return options.map((option, index) => {
    const fill = palette[index % palette.length];
    const darkFill = wooden ? `color-mix(in srgb, ${fill} 28%, #342318)` : DARK_COLORS[index % DARK_COLORS.length];
    const segment = { className: 'wheel-segment', fill, style: { '--dark-segment': darkFill } };
    const fontSize = count > 40 ? 6 : count > 24 ? 8 : count > 16 ? 10 : count > 10 ? 12 : 14.5;
    return <g key={option.id}>
      {count === 1 ? <circle cx="300" cy="300" r="220" {...segment} /> : <path d={slicePath(index, count)} {...segment} stroke={wooden ? 'var(--wood-divider, #7e5b34)' : 'var(--wheel-divider, #fcfbf7)'} strokeWidth={count > 80 ? 0.45 : count > 36 ? 1.1 : 2} />}
      {count <= 120 && <g transform={`rotate(${index * 360 / count} 300 300)`}>
        {wooden && <path d="M375 286q42 8 100 0M379 318q48-9 111-2" fill="none" stroke="#6c4928" opacity=".18" strokeWidth="2" />}
        <text x="506" y="300" textAnchor="end" dominantBaseline="middle" fill={wooden ? 'var(--wood-label, #3f2d1b)' : 'var(--wheel-label, #183225)'} fontSize={fontSize} fontWeight="650" letterSpacing="-.15">{wheelLabel(option.label, fontSize)}</text>
      </g>}
    </g>;
  });
}

function SpinHub({ wooden = false, spinning, empty }) {
  const ink = wooden ? '#ffebbf' : 'var(--wheel-hub-ink, #173425)';
  const accent = wooden ? '#e5b869' : 'var(--wheel-hub-accent, #2e6046)';
  return <g className={`spin-hub ${!spinning && !empty ? 'hub-ready' : ''} ${spinning ? 'hub-spinning' : ''}`}>
    {!spinning && !empty && <circle className="hub-pulse" cx="300" cy="300" r="64" fill="none" stroke={wooden ? '#e5b869' : 'var(--wheel-hub-ring, #7ea463)'} strokeWidth="2.5" opacity=".45" />}
    <circle cx="300" cy="305" r="64" fill="#0f2318" opacity=".18" />
    <circle cx="300" cy="300" r="62" fill={wooden ? 'var(--wood-hub-rim, #5a3e27)' : 'var(--wheel-hub-rim, #d7e2cb)'} />
    <circle cx="300" cy="300" r="57" fill={wooden ? 'url(#woodHubGrad)' : 'url(#classicHubGrad)'} stroke={wooden ? '#8f6940' : 'var(--wheel-hub-border, #f4f7ee)'} strokeWidth="2" />
    <circle cx="300" cy="300" r="49" fill="none" stroke={wooden ? '#b9905a' : 'var(--wheel-tick, #d8e1cd)'} strokeWidth="1" strokeDasharray={wooden ? 'none' : '3 3'} opacity=".85" />
    <g className="hub-icon" transform="translate(288 269)" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 9l3 3 3-3M7 15l-3-3-3 3M6 6a8 8 0 0 1 14 6M4 12a8 8 0 0 0 14 6" />
    </g>
    <text x="300" y="317" textAnchor="middle" fill={ink} fontSize={empty ? 10.5 : 13.5} fontWeight="750" letterSpacing="1.1">{empty ? 'ADD ITEMS' : spinning ? 'SPINNING' : 'SPIN'}</text>
  </g>;
}

export function ClassicWheel({ options, rotation, spinning, duration, onSpin }) {
  return <button className={`wheel-interactive classic-graphic ${spinning ? 'is-spinning' : ''}`} onClick={onSpin} disabled={spinning || !options.length} aria-label="Spin the classic wheel">
    <svg viewBox="22 22 574 556" className="wheel-svg" aria-hidden="true">
      <defs>
        <radialGradient id="classicBezel" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="var(--wheel-rim-hi, #ffffff)" />
          <stop offset="65%" stopColor="var(--wheel-rim, #f5f6ee)" />
          <stop offset="100%" stopColor="var(--wheel-rim-lo, #dde4d2)" />
        </radialGradient>
        <radialGradient id="classicSheen" cx="36%" cy="26%" r="74%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#142d20" stopOpacity="0.12" />
        </radialGradient>
        <radialGradient id="classicHubGrad" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="var(--wheel-hub-hi, #ffffff)" />
          <stop offset="100%" stopColor="var(--wheel-hub, #eef2e5)" />
        </radialGradient>
        <linearGradient id="pointerGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--wheel-pointer-hi, #2d5a42)" />
          <stop offset="100%" stopColor="var(--wheel-pointer, #193828)" />
        </linearGradient>
        <filter id="wheelDrop" x="-12%" y="-12%" width="124%" height="128%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#13291d" floodOpacity="0.16" />
        </filter>
        <filter id="pointerShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="-2" dy="4" stdDeviation="3.5" floodColor="#10251a" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Delicate precision drafting orbit behind the bezel */}
      <circle className="compass-ring" cx="300" cy="300" r="265" fill="none" stroke="var(--wheel-orbit, #b8c7a9)" strokeWidth="1" strokeDasharray="3 7" opacity=".55" />
      <circle cx="300" cy="300" r="256" fill="none" stroke="var(--wheel-orbit, #c9d5bc)" strokeWidth="1" opacity=".35" />

      {/* Main wheel rim with dimensional drop shadow */}
      <g filter="url(#wheelDrop)">
        <circle cx="300" cy="300" r="248" fill="url(#classicBezel)" stroke="var(--wheel-rim-edge, #cfd9c2)" strokeWidth="1.5" />
        <circle cx="300" cy="300" r="241" fill="none" stroke="var(--wheel-rim-inner, #ffffff)" strokeWidth="1.2" opacity=".6" />
      </g>

      {/* Precision degree ticks + 12 brass/gold bezel pins */}
      {Array.from({ length: 72 }, (_, i) => (
        <path key={i} d={i % 6 === 0 ? 'M300 61v9' : 'M300 64v4'} transform={`rotate(${i * 5} 300 300)`} stroke={i % 6 === 0 ? 'var(--wheel-tick-major, #9bab8b)' : 'var(--wheel-tick, #c2cdb5)'} strokeWidth={i % 6 === 0 ? 1.8 : 1} strokeLinecap="round" />
      ))}

      {/* Rotating wheel face */}
      <g className="rotating-wheel" style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${duration}ms` }}>
        <Segments options={options} />
        <circle cx="300" cy="300" r="220" fill="url(#classicSheen)" pointerEvents="none" />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 30} 300 300)`}>
            <circle cx="520" cy="300" r="3.4" fill="var(--wheel-peg, #d8a64e)" stroke="var(--wheel-peg-edge, #8c6626)" strokeWidth="1" />
            <circle cx="519.2" cy="299.1" r="1.1" fill="#fff8e3" opacity=".8" />
          </g>
        ))}
      </g>

      {/* Crisp inner & outer trim rings */}
      <circle cx="300" cy="300" r="221" fill="none" stroke="var(--wheel-inner-rim, #c9d6bc)" strokeWidth="2.5" />
      <circle cx="300" cy="300" r="219" fill="none" stroke="#152b1f" strokeWidth="1" opacity=".1" />

      <SpinHub spinning={spinning} empty={!options.length} />

      {/* Sculpted articulated right-hand pointer */}
      <g className={spinning ? 'wheel-pointer pointer-ticking' : 'wheel-pointer'} filter="url(#pointerShadow)">
        <path d="M567 278 L522 300 L567 322 Q577 326 577 314 L577 286 Q577 274 567 278 Z" fill="url(#pointerGrad)" stroke="var(--wheel-pointer-edge, #d5a34d)" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M565 284 L530 300 L565 300 Z" fill="#ffffff" opacity=".13" />
        <circle cx="561" cy="300" r="6" fill="var(--wheel-pointer-dot, #e5b762)" stroke="var(--wheel-pointer, #193828)" strokeWidth="1.5" />
        <circle cx="559.7" cy="298.7" r="1.7" fill="#fff7e2" opacity=".85" />
      </g>
    </svg>
  </button>;
}

function Farmer({ pointing, dancing }) {
  return <g className={['farmer', pointing && 'farmer-pointing', dancing && 'farmer-dancing'].filter(Boolean).join(' ')} transform="translate(574 408)">
    <ellipse cx="23" cy="151" rx="42" ry="8.5" fill="#214231" opacity=".18" />
    <g className="farmer-leg"><path d="m9 112-4 30" stroke="#456143" strokeWidth="16" strokeLinecap="round" /><path d="M-5 143h16" stroke="#5b412c" strokeWidth="11" strokeLinecap="round" /></g>
    <g className="farmer-leg farmer-leg-right"><path d="m34 112 6 30" stroke="#456143" strokeWidth="16" strokeLinecap="round" /><path d="M33 143h17" stroke="#5b412c" strokeWidth="11" strokeLinecap="round" /></g>
    <g className="farmer-torso">
      <path d="M3 59q19-10 38 0l5 55H-1Z" fill="#efd09f" />
      <path d="M6 57v32h30V57m-37 57 4-32h39l4 32Z" fill="#52754d" />
      <rect x="12" y="88" width="20" height="15" rx="3.5" fill="#6f8f61" stroke="#43603e" strokeWidth="1.2" />
      <circle cx="10" cy="83" r="2.1" fill="#e5b869" /><circle cx="34" cy="83" r="2.1" fill="#e5b869" />
      <circle cx="22" cy="34" r="25" fill="#f1c99e" />
      <ellipse cx="10" cy="40" rx="4.2" ry="2.4" fill="#df8f7d" opacity=".45" />
      <ellipse cx="35" cy="40" rx="4.2" ry="2.4" fill="#df8f7d" opacity=".45" />
      <path d="M-3 29q-3-29 25-29 30 0 25 31l-10-7-14 3-12-3Z" fill="#8f6842" />
      <path d="M-15 18h74M2 14 7-8h31l7 22" stroke="#7d5d38" strokeWidth="9" strokeLinecap="round" fill="#cfa967" />
      <path d="M5 10h35" stroke="#52754d" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="14" cy="34" r="2.4" fill="#2c3322" /><circle cx="31" cy="34" r="2.4" fill="#2c3322" />
      <path d="m17 44q5 4.5 11 0" fill="none" stroke="#8c5840" strokeWidth="2.2" strokeLinecap="round" />
      <path className="farmer-arm-right" d="M40 65 65 59 83 40" stroke="#efd09f" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <g className="farmer-arm"><path d="M4 65-21 59-39 40" stroke="#efd09f" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="m-38 39-8-9" stroke="#efd09f" strokeWidth="6" strokeLinecap="round" /></g>
    </g>
  </g>;
}

export function WaterWheel({ options, rotation, spinning, duration, result, onSpin }) {
  return <button className={`wheel-interactive water-graphic ${spinning ? 'water-running' : ''}`} onClick={onSpin} disabled={spinning || !options.length} aria-label="Pour water and spin the water wheel">
    <svg viewBox="0 0 700 640" className="wheel-svg" aria-hidden="true">
      <defs>
        <linearGradient id="river" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--river-start, #8fc2c7)" />
          <stop offset="55%" stopColor="var(--river-mid, #a9d4d6)" />
          <stop offset="100%" stopColor="var(--river-end, #cde6e2)" />
        </linearGradient>
        <linearGradient id="edgeFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="8%" stopColor="#ffffff" />
          <stop offset="92%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <mask id="waterSceneMask">
          <rect x="0" y="0" width="700" height="640" fill="url(#edgeFade)" />
        </mask>
        <radialGradient id="woodHubGrad" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="var(--wood-hub-hi, #8c6844)" />
          <stop offset="100%" stopColor="var(--wood-hub, #62452b)" />
        </radialGradient>
        <radialGradient id="woodSheen" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#fff4d6" stopOpacity="0.16" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#2c1b0c" stopOpacity="0.16" />
        </radialGradient>
        <pattern id="woodGrain" width="60" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 10q15-5 30 0t30 0M0 30q15 5 30 0t30 0" stroke="#4d3219" opacity=".16" fill="none" />
        </pattern>
      </defs>

      {/* Night stars & crescent moon (visible in dark mode) */}
      <g className="water-night-sky" fill="#f5ebba">
        <circle cx="88" cy="48" r="1.6" /><circle cx="152" cy="84" r="1.2" /><circle cx="218" cy="38" r="1.8" />
        <circle cx="430" cy="46" r="1.5" /><circle cx="480" cy="76" r="1.1" /><circle cx="642" cy="112" r="1.6" />
        <path d="M126 56a14 14 0 1 0 17 17 11 11 0 1 1-17-17Z" opacity=".85" />
      </g>

      {/* Gentle drifting clouds */}
      <g className="water-clouds" fill="var(--water-cloud, #ffffff)" opacity=".74">
        <path d="M45 77q-6-21 14-24 6-27 30-20 15 2 17 23 27-3 27 21Z" />
        <path d="M482 114q-5-14 10-17 3-18 21-15 14 0 16 17 19-2 22 15Z" />
      </g>

      {/* Distant misty hills, lush bank & river feathered smoothly at edges */}
      <g mask="url(#waterSceneMask)">
        <path d="M0 510q115-84 245-32t235-22q120-58 220 16v130H0Z" fill="var(--water-hill-far, #d6e2c2)" opacity=".7" />
        <path d="M0 530q74-86 158-24t124 8q120-96 266-8t152 12v122H0Z" fill="var(--water-hill, #cad8a7)" />
        <path d="M0 560q182-18 308 0t392-5v85H0Z" fill="url(#river)" />
        <path d="M0 582q165-12 315 2t385-6v62H0Z" fill="var(--river-deep, #7cb4bc)" opacity=".28" />
        <g className="river-ripples" stroke="var(--river-ripple, #f3fcf6)" strokeWidth="3" opacity=".75" strokeLinecap="round">
          <path d="M49 586h56m101 13h82m137-11h75m59 31h66M14 621h116m215-7h62" />
        </g>
      </g>

      {/* Timber A-frame mill support */}
      <path d="m298 286-96 286h196Z" stroke="#6c5337" strokeWidth="14" strokeLinejoin="round" fill="#8f7859" />
      <path d="m298 310-68 242h138Z" fill="var(--water-support, #c1cfb1)" />
      <path d="M236 472h124" stroke="#6c5337" strokeWidth="9" strokeLinecap="round" />

      {/* Wheel drop shadow */}
      <circle cx="300" cy="314" r="245" fill="#44301c" opacity=".15" />

      {/* Rotating wooden mill wheel */}
      <g className="rotating-wheel water-rotating" style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${Math.max(0, duration - 650)}ms`, transitionDelay: spinning ? '650ms' : '0ms' }}>
        <circle cx="300" cy="300" r="246" fill="#6f4f2e" stroke="#4c3520" strokeWidth="5" />
        {Array.from({ length: 24 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 15} 300 300)`}>
            <rect x="282" y="46" width="36" height="32" rx="4" fill="#ac834d" stroke="#5d4121" strokeWidth="3" />
            <path d="M288 55h24" stroke="#dbba84" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        ))}
        <Segments options={options} wooden />
        <circle cx="300" cy="300" r="220" fill="url(#woodSheen)" pointerEvents="none" />
        <circle cx="300" cy="300" r="230" fill="none" stroke="#c8a268" strokeWidth="16" />
        <circle cx="300" cy="300" r="238" fill="none" stroke="#6e4f2d" strokeWidth="2" />
        <circle cx="300" cy="300" r="222" fill="none" stroke="#6e4f2d" strokeWidth="2" />
        <circle cx="300" cy="300" r="244" fill="url(#woodGrain)" />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 30} 300 300)`}>
            <circle cx="300" cy="70" r="4.5" fill="#5e462d" stroke="#99764a" strokeWidth="1" />
            <circle cx="299" cy="69" r="1.2" fill="#e6cfa4" opacity=".6" />
          </g>
        ))}
      </g>

      <SpinHub wooden spinning={spinning} empty={!options.length} />

      {/* Brass mill pointer */}
      <g className={spinning ? 'wheel-pointer pointer-ticking' : 'wheel-pointer'}>
        <path d="m558 282-32 18 32 18q6 3 6-4v-28q0-7-6-4Z" fill="#efc15d" stroke="#7c5b2a" strokeWidth="2.8" strokeLinejoin="round" />
        <circle cx="552" cy="300" r="3.5" fill="#7c5b2a" />
      </g>

      {/* Water stream & animated splash droplets */}
      <g className="water-stream" fill="none" strokeLinecap="round">
        <path d="M537 92q-23 36-20 105" stroke="#72c2ca" strokeWidth="20" />
        <path d="M539 95q-20 35-17 98" stroke="#c4eef0" strokeWidth="6" opacity=".7" />
        <path d="M552 100q-24 42-15 99M526 97q-30 40-25 73" stroke="#85ccd3" strokeWidth="7" />
        <path d="m513 191-22 25m34-16 7 29m-11-38-8 35" stroke="#a6e1e6" strokeWidth="6" />
        <g className="splash-foam" fill="#e7f9fa" stroke="none">
          <circle cx="496" cy="222" r="5" /><circle cx="518" cy="236" r="4" /><circle cx="539" cy="225" r="3.5" />
          <ellipse cx="302" cy="558" rx="34" ry="7" opacity=".75" />
          <circle cx="268" cy="552" r="5" /><circle cx="334" cy="553" r="4.5" />
        </g>
      </g>

      {/* Wooden overhead beam supporting the bucket */}
      <path d="M548 14h136" stroke="#6f5235" strokeWidth="8" strokeLinecap="round" />
      <path d="M558 14v18" stroke="#57412c" strokeWidth="3.5" />
      <circle cx="558" cy="14" r="3" fill="#463321" />

      {/* Tipping wooden-iron bucket */}
      <g className="pouring-bucket" style={{ transformOrigin: '558px 69px' }}>
        <path d="M523 48q0-37 37-37t37 37" fill="none" stroke="#6e6348" strokeWidth="5" />
        <path d="m516 41 12 75q32 14 62 0l12-75Z" fill="#9ea498" stroke="#5b6a60" strokeWidth="3.8" />
        <ellipse cx="559" cy="41" rx="43" ry="10" fill="#cdd6c5" stroke="#5b6a60" strokeWidth="3.8" />
        <ellipse cx="559" cy="42" rx="33" ry="5.5" fill="#82c6cc" opacity=".7" />
        <path d="M531 56h55M535 100h47" stroke="#d8ddd1" strokeWidth="4.5" />
        <path d="m541 52 5 51m20-51-2 52m20-51-6 50" stroke="#68766d" strokeWidth="2" />
      </g>

      <Farmer pointing={Boolean(result) && !spinning} dancing={spinning} />

      {result && !spinning && <g className="farmer-bubble">
        <rect x="520" y="346" width="154" height="38" rx="19" fill="var(--water-bubble, #fcfbf2)" stroke="var(--water-bubble-edge, #cfd4b4)" strokeWidth="1.5" />
        <path d="m599 384 9 12 4-13" fill="var(--water-bubble, #fcfbf2)" />
        <text x="597" y="370" textAnchor="middle" fontSize="13.5" fill="var(--water-bubble-text, #425236)" fontWeight="650">That’s the one!</text>
      </g>}

      {/* Foreground reeds/grass tufts */}
      <g fill="var(--water-grass, #638550)">
        <path d="m82 554-9-26 17 16 5-32 8 31 12-12-5 27Z" />
        <path d="m650 565-8-25 15 12 7-28 2 28 12-15-5 29Z" />
      </g>
    </svg>
  </button>;
}

export function AISelector({ options, spinning, result, aiStep, messageOffset, onSpin }) {
  const candidate = result && !spinning ? result.label : spinning ? options[aiStep % options.length]?.label : 'Your destiny is buffering.';
  const message = AI_MESSAGES[(messageOffset + Math.floor(aiStep / 4)) % AI_MESSAGES.length];
  return <button onClick={onSpin} disabled={spinning || !options.length} aria-label="Run the AI assistant selector" className={`ai-console ${spinning ? 'ai-running' : ''} ${result && !spinning ? 'ai-chosen' : ''}`}>
    <div className="console-top">
      <div className="console-dots flex items-center gap-1.5"><i /><i /><i /></div>
      <span className="console-title">chance_assistant.exe</span>
      <span className="console-chip"><Icon name="sparkles" size={12} /> 100% RANDOM</span>
    </div>
    <div className="console-body">
      <div className="console-status">
        <span className="status-led" />
        {spinning ? 'ASSISTANT IS OVERTHINKING' : result ? 'DESTINY SUCCESSFULLY ASSIGNED' : 'ASSISTANT IS READY'}
      </div>

      <div className="ai-orb">
        <div className="orb-aura" />
        <div className="orb-ring ring-one" />
        <div className="orb-ring ring-two" />
        <div className="orb-ring ring-three" />
        <div className="orb-core">
          <Icon name={result && !spinning ? 'check' : 'sparkles'} size={38} />
        </div>
        <span className="orb-spark spark-one">✦</span>
        <span className="orb-spark spark-two">✦</span>
      </div>

      <div className="candidate-panel">
        <span className="candidate-label">{spinning ? 'CONTEMPLATING THE CANDIDATES' : result ? 'THE CHOSEN ONE' : 'EXTREMELY ARTIFICIAL · MILDLY INTELLIGENT'}</span>
        <div className="ai-candidate">{candidate}</div>
      </div>

      <div className="ai-message">{spinning ? message : result ? 'Congratulations. Your prestigious, possibly inconvenient destiny awaits.' : 'Click anywhere on this console to let impeccable randomness make the call.'}</div>

      <div className="console-log">
        <p><span>01</span> {`${options.length} candidate${options.length === 1 ? '' : 's'} loaded. All equally unsuspecting.`}</p>
        <p><span>02</span> {spinning ? 'Pretending this requires a neural network…' : result ? 'Choice made. Taking absolutely all of the credit.' : 'Awaiting permission to be suspiciously helpful.'}</p>
        <p><span>03</span> {spinning ? <span className="log-active">Applying unnecessary dramatic suspense<span className="cursor">_</span></span> : 'Sentience check: negative. Probably.'}</p>
        <div className="console-meter" aria-hidden="true"><span className="console-meter-bar" /></div>
      </div>

      <div className="console-bottom">
        <span>NO REAL AI · JUST REAL CHANCE</span>
        <span className="console-state">{spinning ? 'PROCESSING' : result ? 'COMPLETE' : options.length ? 'CLICK TO RUN' : 'ADD OPTIONS'} <span className="console-dot">●</span></span>
      </div>
    </div>
  </button>;
}
