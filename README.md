# Not a Sentient Wheel

A small, static React app for letting chance make a decision. Three selectors share the same uniformly random selection engine:

- **Classic wheel:** pastel pie segments, decelerating spin, right-hand pointer, and labels that are upright at the pointer.
- **Water wheel:** an illustrated wooden mill wheel, a tipping bucket, animated water, and Felix the farmer pointing out the winner.
- **AI assistant:** a playful terminal with an animated orb and 28 dramatically unhelpful messages. No AI service, account, or API key required.

The desktop layout fills the browser viewport, with list management on the left (approximately 25%) and the selector on the right (75%). Graphics grow or shrink with the available space; the result appears after selection as a compact frosted overlay in the centre of the graphic, fading in over one second. Dismiss it to see the whole graphic or use **Spin again**; long lists scroll within the sidebar. A stacked phone fallback exists, but mobile support is not currently a priority. Subtle animated backgrounds, keyboard controls, reduced-motion support, and optional original synthesized sounds are included.

## Run locally

Use Node.js **22.12 or newer** (Node 24 recommended).

```sh
npm install
npm run dev
```

Open the local address printed by Vite (normally **http://127.0.0.1:5173**). Click the wheel or AI assistant to select; they also work with Enter/Space. Results appear over the centre of the selector once it finishes. Use **Spin again**, close the result with its × button, or press Escape while a result control is focused. Reduced motion reveals results without the fade.

```sh
npm test        # Selection, parsing, persistence, geometry, and URL sharing
npm run build  # Static production output in dist/
npm run preview # Test the production build, normally at port 4173
```

## Try it

1. Start with the example options and spin each of the three themes.
2. Paste words or phrases separated by commas or newlines. Click **Add to the wheel**, or press Ctrl/Cmd+Enter.
3. With **Allow duplicates** unchecked, existing labels and repeated input are skipped, ignoring case. Check it to add each occurrence as a separate entry; duplicate entries have separate chances.
4. Remove an option with its × button. Clear/delete/import actions offer a temporary **Undo**.
5. Refresh or reopen the browser: options, the selected theme, and sound/duplicate/motion preferences remain on this browser and origin.
6. Use **Copy list** or **Export** to keep lists yourself. **Import** reads a `.txt`/`.csv` file and replaces the current list exactly, including intentional duplicates. Paste an old list in the input to append instead. The file format is plain text, one option per line, or comma separated; it is not a quoted CSV parser.
7. **Motion → Full animation** is the default and shows the complete spin even when Windows or a remote desktop requests reduced motion. **Follow system** uses the operating system preference; **Reduced motion** skips spinning and ambient animation and reveals the result quickly. The choice is remembered in this browser, and cannot change during a spin. Full animations take 5 seconds for the classic wheel and AI assistant, or 6.2 seconds for the water wheel.

## URL-sharing POC

On branch `codex/url-sharing-poc`, click **Share list** and then **Copy link**. Open that link in another tab or browser to reconstruct the options. The browser address looks like `https://wernerscholtz.github.io/NotASentientWheel/#list=v1.COMPRESSED_DATA`; the fragment keeps GitHub Pages paths working without a backend. Local testing generates localhost links; those only work on the machine running the app. Public links will work after this branch is deployed.

Links are fixed snapshots of labels in their original order, including spaces, Unicode and intentional duplicates. They do not include option IDs, the result, or personal sound/motion/theme settings. The recipient receives fresh option IDs and keeps their own preferences. Anyone with the link can reconstruct its list; compression is not encryption. No external sharing service or new dependency is used: the codec uses the browser's [native gzip compression](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream).

Opening a shared link replaces the current list and saves the imported copy in this browser. A temporary **Undo** restores the previous list. Invalid or unsupported links keep the existing list and display an explanation. Editing the imported list removes its fragment from the address so a refresh keeps your edits; the original shared link still opens the original snapshot. Links also work when opening another snapshot in the same tab.

The classic and water wheels start at a randomly chosen orientation when the page opens or refreshes, including shared links. List order stays the same. The starting position is separate from winner selection, and is not saved in the shared URL. A refresh can occasionally choose the same starting position again.

The POC caps generated links at **8,000 characters** and decoded JSON at **512,000 bytes**, in addition to the app's normal option limits. Large lists may need text export instead. A current browser with `CompressionStream` and `DecompressionStream` support is required. No backend records exist to expire or revoke.

For a quick check, paste 20 entries such as `Firstname Lastname1` through `Firstname Lastname20`, share, and open the copied link. `npm test` verifies exact reconstruction of that list and interoperability with independently generated gzip data.

## Data and practical limits

Options never go to a server. Clicking **Share list** puts a compressed copy of the options into the URL fragment. Browser localStorage remembers the current list; clearing browser data removes it. Different browsers, devices, and origins have independent lists. If storage or clipboard access fails, the app provides a usable fallback. Export a text file to keep a separate backup.

Up to **500 options**, each **200 characters**, are supported. Oversized batches are rejected with an explanation rather than truncated. Dense wheels use smaller/abbreviated labels (above 120 entries the slices remain, but text is omitted); the sidebar and selected result keep the full text. Commas/newlines always delimit entries. Keep commas out of individual labels.

Web Crypto picks the result before animation, using rejection sampling to avoid modulo bias. Every entry has an equal chance, including repeated labels. The wheel stops with that entry centred on the right-hand pointer. Selection does not remove entries automatically. Editing and theme changes are disabled during a run to keep the result consistent.

## Brand icon and favicon

The header uses `public/brand-icon.png` and the browser favicon uses `public/favicon.png`, both resized from the selected **Option A: Behind the spokes** image. The full-resolution source is kept in `assets/branding/option-a.png` and is not included in the production download.

The previous header mark is preserved in `public/brand-icon-original.svg`; its original wheel drawing also remains in `src/Icons.jsx`. The previous favicon is preserved in `public/favicon-original.svg` (and the unchanged `public/favicon.svg`). To restore both, change the header image filename in `src/App.jsx` to `brand-icon-original.svg`, and set the icon link in `index.html` to `<link rel="icon" type="image/svg+xml" href="./favicon-original.svg" />`.

## GitHub Pages deployment

The app is ready for static hosting; it has no backend and uses relative asset paths, as described in the [Vite production guide](https://vite.dev/guide/build). Tailwind is compiled at build time following its [Vite integration](https://tailwindcss.com/docs/installation/using-vite). React and React DOM are the only production dependencies. No fonts, images, audio, or scripts are fetched from external services at runtime.

The workflow in `.github/workflows/deploy.yml` runs on pushes to `master` and can also be started manually from GitHub's Actions tab. It installs the locked dependencies with `npm ci`, runs the tests, builds the app, and deploys only `dist/` to GitHub Pages. A failed test or build prevents deployment.

Set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The project URL is [https://wernerscholtz.github.io/NotASentientWheel/](https://wernerscholtz.github.io/NotASentientWheel/). Do not deploy the repository root directly: its `index.html` references development JSX that requires Vite's build step. The build replaces that reference with compiled assets using paths relative to the project URL.

See [ENGINEERING.md](ENGINEERING.md) for the practices established before implementation.
