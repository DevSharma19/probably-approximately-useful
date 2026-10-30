// Site navigation, built from the one chapter list below.
// Each page sets <body data-page="..."> (a chapter file name, or "index")
// and data-root ("" for index.html, "../" for chapter pages).
//
// Chapter pages get a sticky header that links to the other chapter pages,
// plus prev/next links at the bottom.
// The index page is the single-scroll view: it fetches each chapter's <main>,
// stacks them as <section id="ch-N">, and the sticky header becomes in-page
// links that highlight the section currently on screen.
// (Fetching needs http(s); on file:// the index falls back to its chapter list.)

const CHAPTERS = [
  { file: "1-pac.html",                 short: "1. PAC",             title: "1. Learning from Samples" },
  { file: "2-vc-dimension.html",        short: "2. VC Dimension",    title: "2. Shattering & VC Dimension" },
  { file: "3-sauer-shelah.html",        short: "3. Sauer–Shelah",    title: "3. The Sauer–Shelah Lemma" },
  { file: "4-uniform-convergence.html", short: "4. Uniform Conv.",   title: "4. Uniform Convergence" },
  { file: "5-fundamental-theorem.html", short: "5. Fundamental Thm", title: "5. The Fundamental Theorem" },
  { file: "6-beyond.html",              short: "6. Beyond",          title: "6. Beyond" },
];

// Mount any widgets registered by widget scripts (window.WIDGETS) that are not mounted yet.
function mountWidgets() {
  for (const [name, mount] of Object.entries(window.WIDGETS || {}))
    document.querySelectorAll(`[data-widget="${name}"]:not([data-mounted])`).forEach((el) => {
      el.dataset.mounted = "1";
      mount(el);
    });
}

// Render KaTeX in el, waiting for the deferred KaTeX scripts if needed.
function renderMath(el) {
  const go = () => renderMathInElement(el, {
    delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
  });
  if (window.renderMathInElement) go();
  else window.addEventListener("load", go, { once: true });
}

(function buildNav() {
  const body = document.body;
  const page = body.dataset.page;
  const root = body.dataset.root || "";
  const single = page === "index";
  const href = (c, i) => (single ? `#ch-${i + 1}` : root + "chapters/" + c.file);

  const header = document.createElement("header");
  header.className = "site";
  header.innerHTML =
    `<a class="title" href="${single ? "#top" : root + "index.html"}">Probably Approximately Useful</a>` +
    CHAPTERS.map((c, i) =>
      `<a href="${href(c, i)}" title="${c.title}"${c.file === page ? ' class="current"' : ""}>${c.short}</a>`
    ).join("");
  body.prepend(header);

  if (single) { loadAllChapters(header); return; }

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

async function loadAllChapters(header) {
  const container = document.getElementById("chapters");
  let docs;
  try {
    docs = await Promise.all(CHAPTERS.map(async (c) => {
      const res = await fetch("chapters/" + c.file);
      if (!res.ok) throw new Error(res.status);
      return new DOMParser().parseFromString(await res.text(), "text/html");
    }));
  } catch (e) {
    // Leave the plain chapter list (in #toc) as the fallback.
    renderMath(document.body);
    return;
  }

  docs.forEach((doc, i) => {
    const section = document.createElement("section");
    section.id = `ch-${i + 1}`;
    section.className = "chapter";
    section.append(...doc.querySelector("main").childNodes);
    container.append(section);
  });
  document.getElementById("toc")?.remove();

  renderMath(document.body);
  mountWidgets();

  // Re-apply a #ch-N hash now that the target exists.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();

  // Highlight the header link for the section in the reading zone.
  const links = [...header.querySelectorAll('a[href^="#ch-"]')];
  const setCurrent = (id) => links.forEach((a) => {
    const on = a.getAttribute("href") === "#" + id;
    a.classList.toggle("current", on);
    if (on) header.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
  });
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
  }, { rootMargin: "-20% 0px -70% 0px" });
  container.querySelectorAll("section.chapter").forEach((s) => observer.observe(s));
}
