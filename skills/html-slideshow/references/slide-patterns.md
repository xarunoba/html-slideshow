# Slide patterns

Ready-made `<section class="slide">` recipes. Copy one, fill in content. All
sizing uses container units (no `px`) — see `responsive-units.md` for the why.

## Title / opener
```html
<section class="slide slide--center">
  <p class="lead">Q3 2026</p>
  <h1>Shipping faster, together</h1>
  <p class="lead">John Doe · Engineering</p>
</section>
```

## Section divider
```html
<section class="slide slide--center">
  <h2>2 — Roadmap</h2>
</section>
```

## Bullets
```html
<section class="slide">
  <h2>What we shipped</h2>
  <ul>
    <li>New onboarding flow (+18% activation)</li>
    <li>Mobile app v2</li>
    <li>SSO for enterprise</li>
  </ul>
</section>
```

## Two columns
```html
<section class="slide">
  <h2>Before / after</h2>
  <div class="cols">
    <div><h3>Before</h3><p>4.2s load, manual deploys.</p></div>
    <div><h3>After</h3><p>0.9s load, deploys on merge.</p></div>
  </div>
</section>
```

## Big stat
```html
<section class="slide slide--center">
  <span class="stat">24%</span>
  <p class="lead">conversion lift after redesign</p>
</section>
```

## Code
```html
<section class="slide">
  <h2>One-line deploy</h2>
<pre><code>npx deploy --prod</code></pre>
</section>
```
Use `<pre>` for code blocks — it scrolls internally and scales fluidly.

## Quote
```html
<section class="slide slide--center">
  <blockquote>
    <p>Simplicity is the ultimate sophistication.</p>
  </blockquote>
</section>
```

## Image / figure
```html
<section class="slide slide--center">
  <figure>
    <img src="diagram.svg" alt="Architecture overview">
    <figcaption class="lead">Service topology</figcaption>
  </figure>
</section>
```

## Closing
```html
<section class="slide slide--center">
  <h1>Thank you</h1>
  <p class="lead">john@example.com · @john</p>
</section>
```

## Citations → sources

Cross-link a citation to its source entry with a hash that targets an `id`. The
link jumps to whichever slide contains that `id`.

On a content slide:
```html
<section class="slide">
  <h2>Refactoring treats the symptoms.</h2>
  <p>Some call a rewrite "the single worst strategic mistake"<sup><a href="#src-1">[1]</a></sup> — except when it isn't.</p>
</section>
```

On the sources slide, give each entry the matching `id`:
```html
<section class="slide">
  <h2>References</h2>
  <ul>
    <li id="src-1"><strong>[1]</strong> John Doe, <em>Things You Should Never Do</em> (2000)</li>
    <li id="src-2"><strong>[2]</strong> Another source…</li>
  </ul>
</section>
```

`#src-1` resolves to the slide that holds the element, so the viewer lands on
the sources slide. See "Deep linking" in `using-the-deck.md`.

## Custom slide variant

Add your own layout by scoping a class under `.slide` in **`base.css`** (never an
inline `<style>` block in the `.html`), using container units:
```css
/* base.css */
.slide.split { display: grid; grid-template-columns: 1fr 1fr; gap: 4cqw; align-items: center; }
.slide.split .pane { font-size: clamp(1rem, 2.6cqw, 2.2rem); }
```
Then use it on a slide:
```html
<section class="slide split">
  <div class="pane">Left</div>
  <div class="pane">Right</div>
</section>
```
Keep every size relative (`cqw`/`cqh`/`clamp`/`fr`/`%`) — never `px`.

## Authoring guidance

- **One idea per slide.** Design for the back row: large type, high contrast, a
  single takeaway.
- **Custom styles** — scope a class under `.slide` (e.g. `.slide.split`) in
  `base.css` — never an inline `<style>` block in the `.html`. Use container
  units, never `px`. Don't repurpose the engine's IDs/classes (`#deck`,
  `.controls`, …) — `engine-anatomy.md` lists what's load-bearing.
- **Custom scripts** — put behavior in `base.js` (one IIFE — add to it), never an
  inline `<script>` block in the `.html`.
