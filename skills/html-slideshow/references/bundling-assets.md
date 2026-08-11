# Bundling assets into one file

The **build** (`bun build --compile --target=browser --minify`) already inlines
everything — CSS, JS, and any images/fonts you reference by relative path — into
one self-contained `.html`. So you usually don't think about bundling: reference
assets normally and build. This doc covers embedding assets directly in the
source (e.g. inline SVG) for when you want them inline before the build.

## The build inlines relative assets

Anything with a relative path in your deck gets inlined + minified at build time:

| In your source | In the built file |
|---|---|
| `<img src="./photo.webp">` | `<img src="data:image/webp;base64,…">` |
| CSS `url("./bg.png")` / `@import` | `url(data:…)` / merged into `<style>` |
| `<link rel="stylesheet" href="./extra.css">` | `<style>…</style>` |
| `<script src="./extra.js">` | `<script type="module">…</script>` |

External/absolute URLs (CDN links) are left untouched.

## Embedding by hand

For assets you want inline in the **source** itself:

| Asset | How | Notes |
|---|---|---|
| SVG (icons, diagrams) | **Inline the `<svg>` markup** | smallest, CSS-stylable — preferred for vector |
| Photos / raster | **Data URI** in `src` or CSS `url()` | base64 ≈ +33% size |
| Fonts | **System fonts first**; else base64 WOFF2 in `@font-face` | embed only if essential |
| Audio / video | Keep external, or data-URI a **small** clip | video bloats the file fast |

**Data-URI one-liner** — base64 the file, prefix the MIME (portable; `tr` strips
the newlines `base64` wraps):
```
echo "data:image/webp;base64,$(base64 photo.webp | tr -d '\n')"
echo "data:font/woff2;base64,$(base64 font.woff2 | tr -d '\n')"
```

## Examples

**Inline SVG (preferred for vector):**
```html
<section class="slide slide--center">
  <svg viewBox="0 0 64 64" width="40cqw" role="img" aria-label="Architecture">
    <path d="…" fill="var(--accent)"/>
  </svg>
</section>
```

**Raster image via data URI:**
```html
<img src="data:image/webp;base64,UklGR…" alt="…" style="max-height:70cqh">
```

## Trade-offs

- Base64 adds **~33%** to binary size; the build minifies CSS/JS but does **not**
  recompress image data — downscale to display size before embedding.
- A few photos are fine; a video is not.
