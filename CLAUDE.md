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
- Give each formal definition or theorem some intuition and at least one concrete example.

## Development

Static site: plain HTML/CSS/JS, no build step. It is hosted on GitHub Pages from the `main` branch root, so pushing to `main` deploys.

- Local preview: `python3 -m http.server 8000`, then open http://localhost:8000. Use a server: opening `index.html` directly (`file://`) can't load the single-scroll view.
- Syntax-check scripts: `node --check js/*.js`

## Architecture

- `chapters/N-*.html` hold all chapter content; each chapter is written exactly once. Each page sets `<body data-page="<file>" data-root="<path to site root>">`. `js/nav.js` builds the sticky header (and prev/next links on chapter pages) from its `CHAPTERS` array. **Add or rename a chapter there.**
- `index.html` is the **single-scroll view**: `nav.js` fetches every chapter page, moves its `<main>` content into `<section id="ch-N">` inside `#chapters`, renders KaTeX, and mounts widgets. Header links become `#ch-N` anchors, and an IntersectionObserver highlights the current one. Fetching needs http(s); on `file://` the page falls back to the static `#toc` list. So chapter content must not depend on page-specific scripts or relative URLs, because it is also rendered from the site root.
- Math is rendered client-side by KaTeX auto-render (CDN), using `$...$` and `$$...$$` delimiters. The same `<head>` block is copied into every page, so change it everywhere.
- Content conventions in `css/style.css`: `<div class="definition|theorem|lemma|example|proof" data-name="(…)">` adds the label automatically. Exercises use `<div class="exercise">` with solutions inside `<details>`. `<p class="todo">` marks unfinished content.
- Interactives mount on `<div class="widget" data-widget="...">`. Each widget script registers `window.WIDGETS.<name> = mount` and calls `mountWidgets()` (in `nav.js`). A new widget needs its `<script>` tag on its chapter page **and** in `index.html`:
  - `js/shattering.js` (chapter 2): each hypothesis class in `CLASSES` has `realize(points, labels)`. It returns `null` if the labeling is impossible, or else a draw function for a consistent hypothesis. The halfplane check is exact because it tests midpoints between critical angles. Keep new classes exact, not heuristic.
  - `js/growth.js` (chapter 3): plots 2^m against the Sauer–Shelah bounds on a log2 y-axis.
- The site must work on phones. Canvases scale with CSS width, and click handlers convert coordinates with `getBoundingClientRect`. Keep that pattern for new widgets, and check the `@media (max-width: 640px)` rules.
