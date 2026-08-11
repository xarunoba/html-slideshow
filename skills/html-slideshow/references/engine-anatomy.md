# Engine anatomy

The engine is three source files plus a build step (all source files are
comment-free; this map is the documentation):

- `assets/base.html` — page skeleton: `<head>`, `<main id="deck">` (empty — slides
  go here), and the chrome. Links `base.css` and `base.js`.
- `assets/base.css` — all styles (sections below).
- `assets/base.js` — all logic (modules below).
- Build it with `bun build --compile --target=browser --minify` → one
  self-contained, minified `.html` (see **Build** below).

## base.html — skeleton

- `<html data-theme="dark|light">` — theme switch (tokens below do the rest).
- `<head>` — meta, `<link rel="stylesheet" href="base.css">`, `<title>`.
- `<main class="deck" id="deck">` — horizontal scroll container. **Direct children
  must be `<section class="slide">`.** Empty by default.
- Chrome (wired by `id`): `#progress` / `#progress-bar`, `#controls` (`#prev`,
  `#dots`, `#counter`, `#next`, `.spacer`, `#fs`, `#ov`), `#dots`, `#hint`.
- `<script src="base.js" defer>`.

## base.css — sections

| Section | Selectors | Notes |
|---|---|---|
| **Design tokens** | `:root`, `[data-theme="dark|light"]` | `--font-*`, `--chrome`; per theme `--bg --fg --muted --accent --code-bg --rule --chrome-bg --chrome-fg`. **Restyle here, not elsewhere.** |
| **Reset / frame** | `html,body` | `100svh` (+ `100vh` `@supports` fallback). |
| **Deck** | `.deck` | `display:flex`; `scroll-snap-type:x mandatory`; `scroll-behavior:smooth`; hidden scrollbar. |
| **Slide** | `.slide` | `flex:0 0 100%`; `scroll-snap-align:start`; **`container-type:size`** (so `cqw`/`cqh` resolve to the slide). Helpers: `.slide--center/-top/-bottom/-full`. |
| **Fluid type** | `.slide h1–h3, p, li, .lead, pre/code, img/video/svg, blockquote, .stat, hr` | All sizes `clamp(min, Ncqw, max)`. **No `px`.** |
| **Columns** | `.cols` | `auto-fit` grid for two-up content. |
| **Focus** | `a:focus-visible, button:focus-visible` | keyboard ring. |
| **Chrome** | `.progress`, `.controls` (+ `> button` flex-centered icons), `.counter`, `.dots` (pseudo-element dots), `.dots-ell` | dots are a `::after` circle on a 1em hit area. |
| **Overview** | `.deck.is-overview`, `.deck.is-overview > .slide` | disables snap; lays slides as `zoom:.31` thumbnails. |
| **Fullscreen** | `:fullscreen .controls` | auto-hide the control pill on hover (dots live inside it). |
| **Motion + print** | `@media (prefers-reduced-motion)`, `@media print` | reduced motion → instant; print → one slide per page, chrome hidden, **light/ink-friendly palette forced (white bg, dark text) regardless of theme**. |
| **Hint** | `.hint` | first-load key reminder. |

## base.js — modules (one IIFE)

- **State** — `current` (active index), `navGuard` (timestamp; suppresses the
  IntersectionObserver during programmatic scrolls).
- **`goTo(i, smooth)`** — core nav. `scrollIntoView` the target + `setActive`.
  `smooth === false` → instant (used by init, overview-exit, Home/End).
- **`setActive(idx)`** — writes state to DOM/URL: `.is-active`, ARIA, counter,
  progress bar, `renderDots`, and `history.replaceState` to `#<n>`.
- **`renderDots(active)`** — windowed dot indicator. `MAX_DOTS` (9): first + last
  always shown, a middle window slides around the active slide, `…` at the gaps.
- **`observe()`** — `IntersectionObserver` (root: deck) sets active on manual
  scroll/swipe; skipped in overview and while `navGuard` is active.
- **`toggleOverview(force, target)`** — toggles `.is-overview`; on exit forces a
  reflow (`void deck.offsetWidth`) then `goTo(target ?? current, false)`.
- **`toggleFullscreen()`** — Fullscreen API on `<html>`.
- **Keyboard** — `→ ↓ Space PgDn` next · `← ↑ PgUp` prev · `Home/End` · `F`
  fullscreen · `O` overview · `Esc` exit overview.
- **Click** — overview: jump to clicked slide · otherwise left/right half =
  prev/next (ignored on `a,button,input,…`).
- **`fromHash()`** — `#3` → slide 3; `#some-id` → slide holding that id; else
  null. `hashchange` → `goTo`.
- **MutationObserver** on `#deck` — rebuilds dots/reobserves when slides
  are added/removed.
- **Init** — `scrollRestoration="manual"`, render dots, observe,
  `goTo(fromHash() ?? 0, false)`, focus deck.

## Build

`bun build --compile --target=browser --minify <deck>.html --outdir dist` runs
Bun's standalone-HTML bundler: it inlines `base.css`/`base.js` and any relative
assets into the `.html`, minified, emitting one self-contained file.

## Common changes

- **New theme** → add a `[data-theme="x"]` block with the tokens. **Print stays
  light automatically** — the `@media print` block forces white bg + dark text.
- **Chrome size** → `--chrome` and the `.controls > button` em sizes.
- **Dot cap** → `MAX_DOTS`.
- **Overview thumbnail size** → `.deck.is-overview > .slide { zoom }`.
- **New slide layout** → a class scoped under `.slide` (container units); add a
  recipe to `slide-patterns.md`.
- **Keep it responsive** → never introduce `px` (see `responsive-units.md`).
- **Add an example** → drop a filled deck in `examples/`.
