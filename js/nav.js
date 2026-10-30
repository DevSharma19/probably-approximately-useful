// Builds the site header and prev/next links from one chapter list.
// Each page sets <body data-page="..."> (a file name below, or "index")
// and data-root ("" for index.html, "../" for chapter pages).

const CHAPTERS = [
  { file: "1-pac.html",           title: "1. Learning from Samples" },
  { file: "2-vc-dimension.html",  title: "2. Shattering & VC Dimension" },
  { file: "3-sauer-shelah.html",  title: "3. The Sauer–Shelah Lemma" },
  { file: "4-uniform-convergence.html", title: "4. Uniform Convergence" },
  { file: "5-fundamental-theorem.html", title: "5. The Fundamental Theorem" },
  { file: "6-beyond.html",        title: "6. Beyond" },
];

(function buildNav() {
  const body = document.body;
  const page = body.dataset.page;
  const root = body.dataset.root || "";
  const href = (c) => root + "chapters/" + c.file;

  const header = document.createElement("header");
  header.className = "site";
  header.innerHTML =
    `<a class="title" href="${root}index.html">Probably Approximately Useful</a>` +
    CHAPTERS.map((c) =>
      `<a href="${href(c)}"${c.file === page ? ' class="current"' : ""}>${c.title}</a>`
    ).join("");
  body.prepend(header);

  const i = CHAPTERS.findIndex((c) => c.file === page);
  if (i === -1) return;
  const prev = i > 0 ? CHAPTERS[i - 1] : null;
  const next = i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : null;
  const pager = document.createElement("nav");
  pager.className = "pager";
  pager.innerHTML =
    (prev ? `<a href="${href(prev)}">← ${prev.title}</a>` : `<a href="${root}index.html">← Home</a>`) +
    (next ? `<a href="${href(next)}">${next.title} →</a>` : "<span></span>");
  document.querySelector("main").append(pager);
})();
