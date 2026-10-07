# Not a Sentient Wheel

A small, private, static React app for letting chance make a decision. Three selectors share the same uniformly random selection engine:

- **Classic wheel:** pastel pie segments, decelerating spin, right-hand pointer, and labels that are upright at the pointer.
- **Water wheel:** an illustrated wooden mill wheel, a tipping bucket, animated water, and Felix the farmer pointing out the winner.
- **AI assistant:** a playful terminal with an animated orb and 28 dramatically unhelpful messages. No AI service, account, or API key required.

The desktop layout fills the browser viewport, with list management on the left (approximately 25%) and the selector on the right (75%). Graphics grow or shrink with the available space while controls and the result remain visible; long lists scroll within the sidebar. A stacked phone fallback exists, but mobile support is not currently a priority. Subtle animated backgrounds, keyboard controls, reduced-motion support, and optional original synthesized sounds are included.

## Run locally

Use Node.js **22.12 or newer** (Node 24 recommended).

```sh
npm install
npm run dev
```

Open the local address printed by Vite (normally **http://127.0.0.1:5173**). Click the wheel or the green button to select; buttons also work with Enter/Space.

```sh
npm test        # Selection, parsing, persistence validation, and geometry
npm run build  # Static production output in dist/
npm run preview # Test the production build, normally at port 4173
```

## Try it

1. Start with the example options and spin each of the three themes.
2. Paste words or phrases separated by commas or newlines. Click **Add to the wheel**, or press Ctrl/Cmd+Enter.
3. With **Allow duplicates** unchecked, existing labels and repeated input are skipped, ignoring case. Check it to add each occurrence as a separate entry; duplicate entries have separate chances.
4. Remove an option with its × button. Clear/delete/import actions offer a temporary **Undo**.
5. Refresh or reopen the browser: options, the selected theme, and sound/duplicate preferences remain on this browser and origin.
6. Use **Copy list** or **Export** to keep lists yourself. **Import** reads a `.txt`/`.csv` file and replaces the current list exactly, including intentional duplicates. Paste an old list in the input to append instead. The file format is plain text, one option per line, or comma separated; it is not a quoted CSV parser.
7. Toggle sound and try a narrow browser window. System reduced-motion settings skip spinning and ambient animation and reveal the result quickly.

## Data and practical limits

Options never go to a server or into a URL. Browser localStorage remembers the current list; clearing browser data removes it. Different browsers, devices, and origins have independent lists. If storage or clipboard access fails, the app provides a usable fallback. Export a text file to keep a separate backup.

Up to **500 options**, each **200 characters**, are supported. Oversized batches are rejected with an explanation rather than truncated. Dense wheels use smaller/abbreviated labels (above 120 entries the slices remain, but text is omitted); the sidebar and selected result keep the full text. Commas/newlines always delimit entries. Keep commas out of individual labels.

Web Crypto picks the result before animation, using rejection sampling to avoid modulo bias. Every entry has an equal chance, including repeated labels. The wheel stops with that entry centred on the right-hand pointer. Selection does not remove entries automatically. Editing and theme changes are disabled during a run to keep the result consistent.

## GitHub Pages, when ready

The app is ready for static hosting; it has no backend and uses relative asset paths, as described in the [Vite production guide](https://vite.dev/guide/build). Tailwind is compiled at build time following its [Vite integration](https://tailwindcss.com/docs/installation/using-vite). React and React DOM are the only production dependencies. No fonts, images, audio, or scripts are fetched from external services at runtime.

Nothing has been pushed or published. Once the local app is approved, use a GitHub Actions Pages deployment: install with `npm ci`, run `npm run build`, upload `dist` with `actions/upload-pages-artifact`, and deploy with `actions/deploy-pages`. Set the repository’s Pages source to **GitHub Actions**. The intended project URL is `https://wernerscholtz.github.io/NotASentientWheel/`.

See [ENGINEERING.md](ENGINEERING.md) for the practices established before implementation.
