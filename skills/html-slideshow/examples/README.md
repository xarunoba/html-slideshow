# Examples

- **`quickstart.html`** — the **raw source** deck. It references the engine in
  `../assets/base.css` and `../assets/base.js`, so it's readable and editable
  (and opens directly here in the repo). This is the form you author.
- **`quickstart-standalone.html`** — the **built** deck: `quickstart.html` passed
  through `bun build --compile --target=browser --minify`. It's a single,
  minified, self-contained `.html` with the CSS, JS, and any assets inlined —
  the file you'd distribute.

## Rebuild the standalone file

After editing `quickstart.html`:

```
bun build --compile --target=browser --minify quickstart.html --outdir /tmp/qs && mv /tmp/qs/quickstart.html quickstart-standalone.html
```
