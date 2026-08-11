# Responsive units guide

The deck must look right on a phone, a laptop, and a 4K projector — and when
embedded in an iframe. The rule that makes this work: **size everything to the
slide, not the screen, and never in fixed `px`.**

## 1. The slide is a query container

Every `.slide` has `container-type: size`, which makes the slide a query
container. Lengths inside it can be expressed as a fraction of the **slide's own
box**:

| Unit | Resolves to |
|------|-------------|
| `cqw` | 1% of the slide width |
| `cqh` | 1% of the slide height |
| `cqi` / `cqb` | 1% of inline / block size |
| `cqmin` / `cqmax` | 1% of the smaller / larger dimension |

Because they track the slide (not the browser window), they are correct whether
the deck is fullscreen, in an iframe, or a resized pane. `vw`/`vh` track the
**viewport** and break the moment the deck isn't full-window — avoid them inside
slides.

> `cqw` resolves against the slide's *content box* (after padding), so it already
> accounts for your slide padding. You don't "lose" space by using it.

## 2. Fluid type with clamp()

Give each text role a floor, a fluid preferred value, and a ceiling:

```css
.kicker { font-size: clamp(1rem, 2cqw, 1.8rem); }
.title  { font-size: clamp(2.2rem, 7cqw, 8rem); }
.body   { font-size: clamp(1rem, 2.6cqw, 2.4rem); }
```

- **Floor** (`min`) — smallest readable size on a phone.
- **Preferred** (`Ncqw`) — scales with the slide.
- **Ceiling** (`max`) — stops type from getting absurd on a huge screen.

The deck's defaults already do this for `h1`–`h3`, `p`, `li`, and `code`.

## 3. Spacing & layout

- Padding / gaps: `cqw` or `em`. e.g. `padding: 6cqw; gap: 2rem;`
- Grid columns: `fr`, `%`, `minmax()`. The `.cols` helper uses
  `repeat(auto-fit, minmax(28cqw, 1fr))`.
- Collapse a layout with a **container query**, not a viewport media query:
  ```css
  @container slide (max-width: 60cqw) {   /* very narrow slide */
    .gallery { grid-template-columns: 1fr; }
  }
  ```
  `@container` keys off the slide; `@media (max-width)` keys off the window and
  is wrong for an embedded or split-pane deck.

## 4. The outer frame

Only the deck's outer frame uses viewport units, and it uses `svh` (small
viewport height) — the smallest the viewport ever gets, so a slide is never
cropped or reflowed by mobile browser chrome:

```css
body, .deck, .slide { height: 100svh; }   /* base.html ships a 100vh fallback */
```

Avoid `dvh`/`lvh` for the frame: they resize as mobile chrome slides in and out
and make slides jump mid-presentation.

## 5. Media

```css
img, video, svg {
  max-width: 100%; max-height: 78cqh; height: auto; object-fit: contain;
}
```
Use `aspect-ratio` to reserve space and avoid layout shift on load.

## Allow / avoid

| ✅ Use | ❌ Avoid |
|--------|----------|
| `cqw cqh cqi cqb cqmin cqmax` | `px`, `pt` |
| `clamp()` / `min()` / `max()` | fixed-breakpoint `@media (width)` |
| `rem` `em` `ch` | hardcoded widths/heights |
| `%` `fr` `auto` | |
| `@container` queries | `dvh` / `lvh` for the frame |
| `svh` / `vh` (outer frame only) | |

## Quick recipes

```css
.huge   { font-size: clamp(3rem, 16cqw, 16rem); }   /* hero number */
.gap-lg { gap: clamp(2rem, 6cqh, 6rem); }           /* vertical rhythm */
.frame  { padding: clamp(1.5rem, 7cqw, 7rem); }     /* safe slide padding */
```
