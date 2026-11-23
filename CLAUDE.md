# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Probably Approximately Useful** is an educational website for a final project in CMU 15-455 (Undergraduate Complexity Theory). The topic is **Computational Learning Theory: VC Dimension and the Fundamental Theorem of PAC Learning**.

**Audience:** undergraduates who have taken 15-455. Assume they know Turing machines, reductions, P/NP, basic probability (union bound, expectation, Chernoff/Hoeffding-style concentration), and how to read proofs. Do **not** assume prior machine-learning knowledge. Define all learning-theory terms before using them.

## Content scope

The site should cover, roughly in this order:

1. **Foundations:** distribution-free PAC learning (realizable setting first), the problem of infinite hypothesis classes, shattering, and the definition of VC dimension, with worked examples (thresholds, intervals, axis-aligned rectangles, halfspaces).
2. **Sauer–Shelah lemma and uniform convergence:** the growth function, a proof of Sauer–Shelah, and how it yields uniform convergence bounds that replace the finite-class union bound.
3. **The Fundamental Theorem of PAC Learning:** finite VC dimension is both **sufficient** (via uniform convergence / ERM) and **necessary** (via a lower-bound argument, e.g. a No-Free-Lunch-style construction on a shattered set) for PAC learnability, including sample complexity bounds.

Where it fits naturally, tie the material back to complexity theory (for example, computational vs. information-theoretic learnability, or the efficiency of ERM).

## Writing guidelines

- Mathematical correctness matters most. State theorems precisely, including quantifiers over distributions, ε, and δ. Keep notation consistent across pages, and check bounds (for example, the dependence on d, 1/ε, and log(1/δ)) against standard references such as Shalev-Shwartz & Ben-David, *Understanding Machine Learning*, or Kearns & Vazirani.
- Notation: $\mathcal{D}$ is always a distribution over labeled pairs $\mathcal{X} \times \{0,1\}$, and error is $L_{\mathcal{D}}(h) = \Pr_{(x,y)\sim\mathcal{D}}[h(x) \ne y]$. The realizable setting (chapters 1–3) is the *assumption* that some $h^\star \in \mathcal{H}$ has $L_{\mathcal{D}}(h^\star) = 0$. Chapter 4 drops it to get the agnostic setting. Don't use target-function notation like $L_{\mathcal{D},f}$.
- Prose style (the author's preference): keep each sentence short, simple, and specific. Use minimal extra language: no run-on sentences, few adverbs, and only brief motivation. Give a short line of intuition where it helps, but don't lean on examples or motivation; let definitions and proofs carry the page.

## Development

Static site: plain HTML/CSS/JS, no build step. It is hosted on GitHub Pages from the `main` branch root, so pushing to `main` deploys.

- Local preview: `python3 -m http.server 8000`, then open http://localhost:8000. Use a server: opening `index.html` directly (`file://`) can't load the single-scroll view.
- Syntax-check scripts: `node --check js/*.js`

## Author's text copy

`reader_text.md` is a plain-prose snapshot of the site for the author to edit. It leaves out boxes, proofs, images, figures, the notation table, widgets, and display math (each removed equation is marked `[display math]`). It is not generated automatically: when the author sends back edits, apply them to the HTML pages, then refresh this file to match.

## Architecture

- `chapters/N-*.html` hold all chapter content; each chapter is written exactly once. Each page sets `<body data-page="<file>" data-root="<path to site root>">`. `js/nav.js` builds the sticky header (and prev/next links on chapter pages) from its `CHAPTERS` array. **Add or rename a chapter there.**
- `index.html` is the **single-scroll view**: `nav.js` fetches every chapter page, moves its `<main>` content into `<section id="ch-N">` inside `#chapters`, renders KaTeX, and mounts widgets. Header links become `#ch-N` anchors, and an IntersectionObserver highlights the current one. Fetching needs http(s); on `file://` only the static `#toc` chapter list is shown. The `#toc` list (above Notation) stays in the single-scroll view, and `nav.js` rewrites its links to `#ch-N`. So chapter content must not depend on page-specific scripts or relative URLs, because it is also rendered from the site root.
- Math is rendered client-side by KaTeX auto-render (CDN), using `$...$` and `$$...$$` delimiters. The same `<head>` block is copied into every page, so change it everywhere.
- Content conventions in `css/style.css`: `<div class="definition|theorem|lemma|corollary|example" data-name="(…)">` adds the label automatically. Proofs are collapsible: `<details class="proof"><summary>Proof</summary>…</details>`, closed by default. Worked examples use `<div class="example" data-result="…">` so the box title is "Example: " followed by the result (plain text, no math), followed by a collapsible proof when one is given. The site has no exercises (the author removed them). The author has reviewed all content and removed the review checklists. `<p class="todo">` and `<div class="todo todo-main">` styles still exist for marking unfinished work. Diagrams are inline SVG in `<figure class="figure">` with a `viewBox`, sized to fit a phone without scrolling.
- Cross-references: give a box an `id` and link to it as `<file>.html#<id>` (relative to `chapters/`), even within the same chapter. `nav.js` rewrites these to `#<id>` wherever the target is on the current page (always, in the single-scroll view). Boxes with an `id` get a `scroll-margin-top` so the sticky header doesn't cover them.
- Interactives mount on `<div class="widget" data-widget="...">`. Each widget script registers `window.WIDGETS.<name> = mount` and calls `mountWidgets()` (in `nav.js`). A new widget needs its `<script>` tag on its chapter page **and** in `index.html`:
  - `js/shattering.js` (chapter 2): each hypothesis class in `CLASSES` has `realize(points, labels)`. It returns `null` if the labeling is impossible, or else a draw function for a consistent hypothesis. The halfplane check is exact because it tests midpoints between critical angles. Keep new classes exact, not heuristic.
  - `js/growth.js` (chapter 3): plots 2^m against the Sauer–Shelah bounds on a log2 y-axis.
- `js/lightbox.js`: any `<a data-lightbox href="img.png">` opens the image in a same-page overlay (closes with ×, Esc, backdrop click, or Back; clicking the image zooms). Images live in `images/`.
- The site must work on phones. Canvases scale with CSS width, and click handlers convert coordinates with `getBoundingClientRect`. Keep that pattern for new widgets, and check the `@media (max-width: 640px)` rules.
