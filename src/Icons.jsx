export function Icon({ name, size = 20, ...props }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    trash: <><path d="M3 6h18M9 6V4h6v2M6 6l1 14h10l1-14M10 10v6M14 10v6" /></>,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V3H3v13h5" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7 .5l3-3a5 5 0 0 0-7-7l-2 2" /><path d="M14 11a5 5 0 0 0-7-.5l-3 3a5 5 0 0 0 7 7l2-2" /></>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></>,
    upload: <><path d="M12 16V3m-4 4 4-4 4 4M4 16v5h16v-5" /></>,
    sound: <><path d="m11 4-6 5H2v6h3l6 5V4Z" /><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></>,
    muted: <><path d="m11 4-6 5H2v6h3l6 5V4Z" /><path d="m16 9 5 6m0-6-5 6" /></>,
    wheel: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><path d="M12 3v7m0 4v7M3 12h7m4 0h7M5.6 5.6l5 5m3 3 4.8 4.8M5.6 18.4l5-5m3-3 4.8-4.8" /></>,
    water: <><path d="M12 2C9 7 5 10 5 14a7 7 0 0 0 14 0c0-4-4-7-7-12Z" /><path d="M8 14a4 4 0 0 0 4 4" /></>,
    sparkles: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 6a8 8 0 0 1 14 6M4 12a8 8 0 0 0 14 6" /></>,
    leaf: <><path d="M20 3c-9 0-16 2-16 9a7 7 0 0 0 7 7c7 0 9-7 9-16Z" /><path d="m4 21 11-11" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.sparkles}</svg>;
}
