# Engineering guide

This document is the reference for development and future agents working on Not a Sentient Wheel. It was written before application code.

## Stack and deployment

- Use React and modern JavaScript, Vite for development and static builds, and Tailwind CSS for the interface. Keep production dependencies limited to React and React DOM; Tailwind and Vite are build tools. Prefer native browser APIs over utility libraries.
- Deploy only static files. GitHub Pages cannot execute a server. Use a relative Vite base (`./`) so assets work under the repository path. Avoid client-side routes that require server rewrites.
- Keep generated assets small. Target less than 5 MB for the complete production download; use SVG/CSS illustrations and Web Audio synthesis instead of large image or audio files.
- Do not publish or push changes without the user's requested review of the local app.

## State and data

- Keep option records uniquely identified; duplicate labels must remain independently removable and selectable.
- Parse pasted input on commas and newlines, trim whitespace, and discard empty entries. Define deduplication explicitly and apply it both within pasted input and against existing labels.
- Store the list in localStorage, with schema validation and guarded reads/writes. Storage failures must not prevent use. Never encode lists in links or send user options over the network.
- Provide plain-text copy, export, and import. Treat labels as text, never HTML. Explain any practical limits in the interface instead of silently dropping data.
- Keep selection logic independent of graphics. Choose a uniform random index using Web Crypto with rejection sampling. Decide the result before animation; all themes must reveal that same selected record.
- Freeze the options snapshot during selection, prevent overlapping runs, and make cancel/reset/unmount cleanup explicit. Avoid stale timer callbacks.

## React architecture

- Use small components with clear ownership: option management, selector presentation, shared animation/control state, and theme-specific rendering.
- Extract pure parsing, persistence validation, geometry, and randomness helpers. Do not duplicate result calculations across themes.
- Use refs for browser resources and timers; clean up effects. Never mutate state arrays or use array indices as stable record keys.
- Use CSS transitions/animations for ongoing visual motion. Avoid driving a whole React tree at display refresh rate.

## Experience and accessibility

- Desktop layout: option management occupies roughly 25%, selection roughly 75%. Fill the available viewport width and height; do not impose a page width cap or require page scrolling. Reserve space for all controls and the result, and let the selector graphics grow or shrink within the remaining space. Only the options list and textarea should scroll. A stacked mobile fallback exists, but mobile support is not currently a priority.
- Make spinning possible with mouse, touch, and keyboard. Label icon buttons; expose disabled states and progress, and announce the selected result with a live region.
- Follow system reduced-motion preferences by default, including background effects. Provide a browser-persisted choice to explicitly enable full animations or reduced motion; resolve that choice consistently for CSS and selection timing. Keep the active animation mode fixed during a spin. Offer a sound toggle; start audio only following a user gesture. Audio failure must not block selection.
- Use readable contrast, visible focus, sufficiently large targets, and text status in addition to color and animation.
- Keep long labels usable, including in lists and final results. Dense wheel labels may be abbreviated visually while preserving full labels elsewhere.
- Make the three themes visually distinctive while keeping the same controls and predictable selection behavior.

## Verification and maintenance

- Verify pure logic with native Node tests: parsing, duplicate handling, random boundaries, wheel-to-pointer geometry, and persisted-data validation.
- Build the production bundle and measure its size. Check the built app under a repository-style subpath as well as the development server.
- Exercise all themes, deletion, append, duplicates, empty and single-entry states, persistence, import/export, keyboard use, and reduced motion in a browser. For desktop layout changes, check laptop and large-display viewport sizes (including 1440×800 and 2560×1300), and verify that controls and results stay visible without page scrolling. Avoid asserting a layout passes merely because overflow has been hidden: inspect the actual content bounds.
- Document local commands, browser-only persistence, data format, and GitHub Pages deployment steps in README.md. Keep generated output and node_modules out of Git.
- Prefer focused fixes to speculative abstraction. Add tests where they protect real behavior, not where they simply restate styling.
