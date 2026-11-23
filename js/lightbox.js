// Lightbox: links marked <a data-lightbox href="image.png"> open the image in a
// full-screen overlay on the same page instead of navigating to the file.
// Close: the × button, Escape, a click on the backdrop, or the browser Back button.
// Clicking the image toggles a closer zoom (for reading small text on phones).

(function () {
  let overlay = null;
  let opener = null;

  function close(fromPopState) {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.body.classList.remove("lightbox-open");
    // Drop the history entry we pushed on open, unless Back already did.
    if (!fromPopState && history.state && history.state.lightbox) history.back();
    opener?.focus();
  }

  function open(link) {
    opener = link;
    const img = link.querySelector("img");
    overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", img?.alt || "Image");
    overlay.innerHTML =
      `<button class="lightbox-close" aria-label="Close">×</button>` +
      `<img src="${link.getAttribute("href")}" alt="${(img?.alt || "").replace(/"/g, "&quot;")}">`;
    const big = overlay.querySelector("img");

    overlay.addEventListener("click", (e) => {
      if (e.target === big) big.classList.toggle("zoomed");
      else close(false);
    });
    document.body.append(overlay);
    document.body.classList.add("lightbox-open");
    history.pushState({ lightbox: true }, "");
    overlay.querySelector(".lightbox-close").focus();
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-lightbox]");
    if (!link || e.ctrlKey || e.metaKey || e.shiftKey) return; // let modified clicks open a tab
    e.preventDefault();
    open(link);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(false); });
  window.addEventListener("popstate", () => close(true));
})();
