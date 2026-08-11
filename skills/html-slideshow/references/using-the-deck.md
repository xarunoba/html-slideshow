# Using the base deck

The engine is three files: `assets/base.html` (page skeleton + your slides),
`assets/base.css` (styles), and `assets/base.js` (navigation). You can improve or extend them as needed — this is the engine source, not a static artifact. A Bun build inlines and minifies them into one self-contained `.html` to distribute.

**Requires [Bun](https://bun.sh).**

## Set up

1. **Copy the template** — copy `base.html`, `base.css`, and `base.js` into your
   deck folder (side by side). You can rename the `.html` (e.g. `my-deck.html`);
   the CSS/JS are referenced by relative path.
2. **Title** — edit `<title>`.
3. **Slides** — inside `<main id="deck">`, add one `<section class="slide">` per
   slide (the deck ships empty; see `../examples/` for filled decks).

## The slide contract

- One slide = one `<section class="slide">`.
- Each slide is a CSS query container, so size its content with **container
  units** (`cqw` / `cqh` / `cqmin`) and `clamp()`. **No fixed `px`.** See
  `responsive-units.md`.
- Layout helpers: `slide--center`, `slide--top`, `slide--bottom`, `slide--full`.
  Two-up content: `<div class="cols">`.
- Ready-made slide recipes: `slide-patterns.md`.

## Build

```sh
bun build --compile --target=browser --minify my-deck.html --outdir dist   # -> dist/my-deck.html
```

Bun bundles `base.css` + `base.js` (and any images/fonts referenced by relative
path) into the `.html`, minified. `dist/my-deck.html` is the file you share — one
self-contained `.html`, no external files. Omit `--minify` for a readable build.

## Built-in navigation

| Input | Action |
|---|---|
| `→` `↓` `Space` `PgDn` | Next |
| `←` `↑` `PgUp` | Previous |
| `Home` / `End` | First / last |
| `F` | Fullscreen |
| `O` | Overview (all slides as thumbnails) |
| Click / tap — left/right half | Prev / next (ignored on links & inputs) |
| Touch swipe | Prev / next |

Plus a progress bar, slide counter, and a windowed dot indicator.

## Deep linking

Every slide has a number, and that number is the URL hash — so slides are
shareable and can link to each other.

- **Share a slide:** `my-deck.html#5` opens on slide 5. The hash updates as the
  viewer navigates, so the URL always points at the current slide.
- **Link slide → slide:** an anchor whose `href` is the slide number jumps there.
  ```html
  <a href="#7">see the roadmap</a>
  ```
- **Link to a specific target:** if an element has an `id`, `href="#that-id"`
  jumps to whatever slide contains it — so a citation can point at its exact
  source entry (recipe in `slide-patterns.md`).
  ```html
  <sup><a href="#src-1">[1]</a></sup>   <!-- jumps to the slide holding #src-1 -->
  ```
- These in-deck links navigate normally — click-to-advance never intercepts them.

## Output

- **Present:** open the built `.html` in any browser; press `F` for fullscreen.
- **Handout:** print or save as PDF — one slide per page, chrome hidden, **forced
  to a light, ink-friendly palette** for readability.
