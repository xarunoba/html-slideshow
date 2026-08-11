---
name: html-slideshow
description: Build a responsive, self-contained HTML slideshow (slide deck / presentation) as a single .html file. Each slide is one <section>. Use this whenever the user asks for slides, a slideshow, a slide deck, a presentation, a pitch deck, talk slides, an HTML presentation, or wants to present, teach, or demo something one screen at a time — even when they don't say "slideshow" explicitly.
---

# html-slideshow

A responsive slideshow bundled into **one self-contained, minified `.html`**.
Author slides in HTML; the engine (`assets/base.css` + `base.js`) plus a Bun build
produce the final file. **Requires [Bun](https://bun.sh).**

## Workflow

1. **Copy the template** — copy `assets/base.html`, `assets/base.css`, and
   `assets/base.js` into your deck folder (side by side; you can rename them as you please).
2. **Set title + theme** — in the `.html`, edit `<title>` and `data-theme` on
   `<html>` (`dark` or `light` — equal peers).
3. **Add slides** — in `<main id="deck">`, one `<section class="slide">` per slide:
   ```html
   <section class="slide">
     <h2>Quarterly results</h2>
     <ul><li>Revenue up 24%</li></ul>
   </section>
   ```
4. **Size with container units — never `px`.** Each slide is a CSS query
   container, so use `cqw`/`cqh`/`cqmin` and `clamp()` and content scales to any
   screen. `px`/`pt` break responsiveness — don't use them (the outer frame uses
   `svh`). This is the one rule agents get wrong; full guide in
   `references/responsive-units.md`.
   Portrait viewports are handled for you: slides render at their landscape
   canvas and scale to fit, so wide tables/grids never overflow a phone screen
   (`--slide-w`/`--slide-h` on `:root`, default `16`/`9`).
5. **Build** — `bun build --compile --target=browser --minify my-deck.html --outdir dist` →
   `dist/my-deck.html`: a single, minified, self-contained file with the CSS, JS,
   and any referenced assets inlined. **This is the file you distribute.**
6. **Verify** the **built** file in a browser: arrow keys step; narrow the window;
   `O` overview; `F` fullscreen; print preview (one slide per page).
7. **Clean up** — remove the template files (`base.html`, `base.css`, `base.js`)
   and any intermediate artifacts, leaving only `dist/my-deck.html` for
   distribution. You can do this manually or with a script:
   ```bash
   rm base.html base.css base.js
   rm -rf dist  # Rebuild if you need the built file again
   ```

## Reference index

Load on demand — not all up front:

- `references/using-the-deck.md` — setup, the slide contract, full navigation,
  **deep links** (`#5` opens slide 5; `#some-id` opens the slide holding that id;
  use for citations → sources), the build, and print.
- `references/slide-patterns.md` — ready-made slide recipes + authoring guidance.
- `references/responsive-units.md` — the no-`px` fluid-sizing guide.
- `references/bundling-assets.md` — inline SVG / data-URI assets (the build also
  inlines relative refs).
- `references/engine-anatomy.md` — map of the engine (`base.html` / `base.css` /
  `base.js`) for changing it.
- `examples/quickstart.html` — a filled deck (source; build it for a
  self-contained file).

## When to use

When the output should be shown one full screen at a time: a talk, lesson, demo,
status update, or pitch. Not for scrolling prose or documents.
