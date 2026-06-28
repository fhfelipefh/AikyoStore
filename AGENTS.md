# Agent Instructions

## Project Overview

AikyoStore is a static storefront page in Portuguese for Instagram-based product orders. The app is plain HTML, CSS, and JavaScript with no build step or package manager configured.

Primary files:

- `index.html` contains the page structure and copy.
- `style.css` contains all layout, theme, and responsive styles.
- `main.js` contains menu behavior, active section tracking, theme toggling, back-to-top behavior, and the dynamic footer year.
- `img/` and `assets/fonts/` contain committed visual/font assets used directly by the page.

## Local Development

There is no install step.

To preview locally, run a static server from the repository root, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Opening `index.html` directly may work for quick checks, but a local server is preferred when verifying asset paths and browser behavior.

## Editing Guidelines

- Keep all user-facing copy in Brazilian Portuguese unless the task explicitly asks otherwise.
- Preserve the static-site architecture. Do not add frameworks, bundlers, package managers, or generated build outputs unless specifically requested.
- Keep external links that open new tabs using `target="_blank"` with `rel="noreferrer"`.
- Maintain accessibility attributes already present on navigation buttons, icons, images, and landmark elements.
- When adding product images, place them under `img/products/`, use meaningful `alt` text, and include `loading="lazy"` and `decoding="async"` for non-critical images.
- Prefer CSS custom properties already defined in `:root` and `body.dark` for colors, fonts, shadows, and theme-aware styling.
- Keep JavaScript dependency-free and written in the same style as `main.js`: small functions, direct DOM APIs, and feature checks where elements may be optional.

## Validation Checklist

Before finishing changes, verify the page in a browser or local server when practical:

- Header navigation opens/closes on mobile and closes after selecting a link.
- Escape closes the mobile menu.
- Active navigation state updates while scrolling.
- Theme toggle switches icons and persists through reloads.
- Back-to-top button appears after scrolling and returns to the home section.
- Layout remains usable at narrow mobile widths and desktop widths.
- Images, fonts, favicon assets, and Instagram links still load correctly.

## Git Hygiene

- Do not commit generated caches, local server files, or temporary screenshots.
- Do not overwrite unrelated user changes in the working tree.
