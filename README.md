# html-slideshow

A skill that lets any AI agent build a
**responsive, self-contained HTML slideshow** as a single minified `.html` file.

Each slide is one `<section>`. The engine (layout, keyboard / click / touch
navigation, fullscreen, overview, hash deep-links, print-to-PDF) lives in
`base.css` + `base.js`; a Bun build bundles + minifies everything into one file
that opens in any browser. **Requires [Bun](https://bun.sh).**

## Install

Not on a registry — it's just files. Clone it:

```sh
git clone https://github.com/xarunoba/html-slideshow.git
```

Then make `skills/html-slideshow/` available to your agent as the
`html-slideshow` skill (how you do that depends on your harness — point it at
the directory, or copy/symlink it into wherever your agent loads skills from).
The only runtime dependency is [Bun](https://bun.sh)
(`curl -fsSL https://bun.sh/install | bash`).

## Use

Ask your agent something like *"make a slideshow presenting …"* and it will:

1. Copy the template — `base.html`, `base.css`, `base.js` — into a deck folder.
2. Pick a theme (`data-theme="dark"` or `"light"`) and set the title.
3. Add `<section class="slide">` blocks for each slide.
4. Size content with container-query units + `clamp()` (no fixed `px`).
5. Build with `bun build` → one self-contained, minified `.html`.

See `skills/html-slideshow/SKILL.md` for the full workflow. `references/`
covers the rest: `using-the-deck.md` (setup), `slide-patterns.md` (slide
recipes), `responsive-units.md` (sizing units), `engine-anatomy.md` (the
`base.*` engine internals), and `bundling-assets.md` (the one-file build).

## Why it's responsive

Every slide is a CSS query container (`container-type: size`), so content scales
to the slide's own box via `cqw` / `cqh` / `cqmin` — correct on a phone, a
laptop, a 4K projector, or inside an iframe. The outer frame uses `svh` so slides
are never cropped by mobile browser chrome.

## Structure

```
skills/html-slideshow/
├── SKILL.md
├── assets/
│   ├── base.html              # page skeleton (empty deck — copy this)
│   ├── base.css               # engine styles
│   └── base.js                # engine logic
├── examples/
│   ├── README.md              # raw vs built — how the example is structured
│   ├── quickstart.html        # raw source deck (references ../assets/)
│   └── quickstart-standalone.html  # built: one minified self-contained .html
└── references/
    ├── using-the-deck.md      # setup, slide contract, navigation & build
    ├── bundling-assets.md     # inline SVG / data-URI assets
    ├── slide-patterns.md      # ready-made slide recipes
    ├── responsive-units.md    # the no-px fluid-sizing guide
    └── engine-anatomy.md      # engine map (base.html / base.css / base.js)
```

## License

MIT
