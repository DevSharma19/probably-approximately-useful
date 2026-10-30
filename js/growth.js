// Growth-function plot: compares 2^m with the Sauer–Shelah bound
// Φ_d(m) = Σ_{i=0}^{d} C(m, i) and the simplified bound (em/d)^d (for m ≥ d).
// The y-axis is log2, so 2^m is a straight line and polynomials bend away.

(function () {
  const W = 560, H = 340, PAD = { l: 50, r: 20, t: 20, b: 40 };

  function binom(m, i) {
    if (i < 0 || i > m) return 0;
    let r = 1;
    for (let k = 1; k <= i; k++) r = (r * (m - k + 1)) / k;
    return r;
  }
  const sauer = (m, d) => { let s = 0; for (let i = 0; i <= d; i++) s += binom(m, i); return s; };

  const SERIES = [
    { name: "2^m (all labelings)", color: "#57606a", f: (m) => Math.pow(2, m) },
    { name: "Sauer–Shelah bound Σ C(m,i), i ≤ d", color: "#c41230", f: (m, d) => sauer(m, d) },
    { name: "(em/d)^d, for m ≥ d", color: "#0969da", f: (m, d) => (m >= d ? Math.pow((Math.E * m) / d, d) : NaN), dashed: true },
  ];

  function mount(root) {
    root.innerHTML = `
      <div class="controls">
        <label>VC dimension d = <b data-out="d"></b> <input type="range" min="1" max="10" value="3" data-in="d"></label>
        <label>max m = <b data-out="m"></b> <input type="range" min="5" max="50" value="25" data-in="m"></label>
      </div>
      <canvas width="${W}" height="${H}"></canvas>
      <div>${SERIES.map((s) => `<span style="color:${s.color}">${s.dashed ? "- -" : "—"} ${s.name}</span>`).join("&nbsp;&nbsp; ")}</div>`;
    const ctx = root.querySelector("canvas").getContext("2d");
    const inD = root.querySelector('[data-in="d"]'), inM = root.querySelector('[data-in="m"]');

    function draw() {
      const d = +inD.value, M = +inM.value;
      root.querySelector('[data-out="d"]').textContent = d;
      root.querySelector('[data-out="m"]').textContent = M;
      ctx.clearRect(0, 0, W, H);

      const yMax = M; // log2(2^M)
      const X = (m) => PAD.l + (m / M) * (W - PAD.l - PAD.r);
      const Y = (v) => H - PAD.b - (Math.log2(v) / yMax) * (H - PAD.t - PAD.b);

      // Axes and ticks
      ctx.strokeStyle = "#8c959f"; ctx.fillStyle = "#57606a"; ctx.font = "12px system-ui";
      ctx.beginPath(); ctx.moveTo(PAD.l, PAD.t); ctx.lineTo(PAD.l, H - PAD.b); ctx.lineTo(W - PAD.r, H - PAD.b); ctx.stroke();
      const step = Math.max(1, Math.round(M / 10));
      for (let m = 0; m <= M; m += step) ctx.fillText(m, X(m) - 4, H - PAD.b + 15);
      for (let k = 0; k <= yMax; k += Math.max(1, Math.round(yMax / 6))) ctx.fillText("2^" + k, 8, Y(Math.pow(2, k)) + 4);
      ctx.fillText("m (sample size)", W / 2 - 40, H - 8);

      // m = d marker: left of it, the bound equals 2^m
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(X(d), PAD.t); ctx.lineTo(X(d), H - PAD.b); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText("m = d", X(d) + 4, PAD.t + 12);

      for (const s of SERIES) {
        ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.setLineDash(s.dashed ? [6, 4] : []);
        ctx.beginPath();
        let started = false;
        for (let m = 0; m <= M; m++) {
          const v = s.f(m, d);
          if (!(v > 0) || Math.log2(v) > yMax * 1.05) { started = false; continue; }
          started ? ctx.lineTo(X(m), Y(v)) : ctx.moveTo(X(m), Y(v));
          started = true;
        }
        ctx.stroke();
      }
      ctx.setLineDash([]); ctx.lineWidth = 1;
    }

    inD.addEventListener("input", draw);
    inM.addEventListener("input", draw);
    draw();
  }

  document.querySelectorAll("[data-widget=growth]").forEach(mount);
})();
