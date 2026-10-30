// Shattering game: the reader places points, picks a hypothesis class, and
// sees which of the 2^n labelings the class can realize.
//
// Each class has realize(points, labels) -> null (not realizable) or a
// draw(ctx) function that draws one hypothesis consistent with the labeling.
// Labels: true = positive (+), false = negative (−).

(function () {
  const W = 480, H = 320, THUMB = 0.25, MAX_POINTS = 7, R = 7;

  const split = (pts, labels) => ({
    pos: pts.filter((_, i) => labels[i]),
    neg: pts.filter((_, i) => !labels[i]),
  });

  // Convex hull (Andrew's monotone chain), counter-clockwise.
  function hull(pts) {
    const p = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
    if (p.length < 3) return p;
    const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lower = [], upper = [];
    for (const q of p) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
      lower.push(q);
    }
    for (const q of [...p].reverse()) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
      upper.push(q);
    }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  }

  function insideConvex(poly, q) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      if ((b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x) < 0) return false;
    }
    return true;
  }

  const CLASSES = {
    threshold: {
      name: "Thresholds on the x-axis: h(x) = 1[x ≥ t]",
      realize(pts, labels) {
        const { pos, neg } = split(pts, labels);
        const lo = Math.max(-Infinity, ...neg.map((p) => p.x));
        const hi = Math.min(Infinity, ...pos.map((p) => p.x));
        if (lo >= hi) return null;
        const t = isFinite(lo) && isFinite(hi) ? (lo + hi) / 2 : isFinite(hi) ? hi - 10 : isFinite(lo) ? lo + 10 : W / 2;
        return (ctx) => { ctx.fillRect(t, 0, W - t, H); };
      },
    },
    interval: {
      name: "Intervals on the x-axis: h(x) = 1[a ≤ x ≤ b]",
      realize(pts, labels) {
        const { pos, neg } = split(pts, labels);
        if (!pos.length) return () => {};
        const a = Math.min(...pos.map((p) => p.x)), b = Math.max(...pos.map((p) => p.x));
        if (neg.some((p) => p.x >= a && p.x <= b)) return null;
        return (ctx) => { ctx.fillRect(a - 6, 0, b - a + 12, H); };
      },
    },
    halfspace: {
      name: "Halfplanes in ℝ²: h(x) = 1[w·x ≥ b]",
      realize(pts, labels) {
        const { pos, neg } = split(pts, labels);
        if (!pos.length) return () => {};
        if (!neg.length) return (ctx) => ctx.fillRect(0, 0, W, H);
        // The separating directions form an open arc whose endpoints are
        // perpendicular to some p_i - p_j, so testing the midpoints between
        // consecutive such "critical" angles is exact.
        const crit = [];
        for (let i = 0; i < pts.length; i++)
          for (let j = i + 1; j < pts.length; j++) {
            const t = Math.atan2(pts[j].y - pts[i].y, pts[j].x - pts[i].x) + Math.PI / 2;
            crit.push(((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
            crit.push((crit[crit.length - 1] + Math.PI) % (2 * Math.PI));
          }
        crit.sort((a, b) => a - b);
        const tries = crit.map((a, k) =>
          k + 1 < crit.length ? (a + crit[k + 1]) / 2 : (a + crit[0] + 2 * Math.PI) / 2);
        for (const th of tries) {
          const w = { x: Math.cos(th), y: Math.sin(th) };
          const dot = (p) => w.x * p.x + w.y * p.y;
          const maxNeg = Math.max(...neg.map(dot)), minPos = Math.min(...pos.map(dot));
          if (maxNeg < minPos) {
            const b = (maxNeg + minPos) / 2;
            return (ctx) => {
              // Fill the half-plane {x : w·x ≥ b} by drawing a big polygon.
              const c = { x: w.x * b, y: w.y * b }, d = { x: -w.y, y: w.x }, L = 2000;
              ctx.beginPath();
              ctx.moveTo(c.x + d.x * L, c.y + d.y * L);
              ctx.lineTo(c.x - d.x * L, c.y - d.y * L);
              ctx.lineTo(c.x - d.x * L + w.x * L, c.y - d.y * L + w.y * L);
              ctx.lineTo(c.x + d.x * L + w.x * L, c.y + d.y * L + w.y * L);
              ctx.fill();
            };
          }
        }
        return null;
      },
    },
    rectangle: {
      name: "Axis-aligned rectangles",
      realize(pts, labels) {
        const { pos, neg } = split(pts, labels);
        if (!pos.length) return () => {};
        const x0 = Math.min(...pos.map((p) => p.x)), x1 = Math.max(...pos.map((p) => p.x));
        const y0 = Math.min(...pos.map((p) => p.y)), y1 = Math.max(...pos.map((p) => p.y));
        if (neg.some((p) => p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1)) return null;
        return (ctx) => ctx.fillRect(x0 - 6, y0 - 6, x1 - x0 + 12, y1 - y0 + 12);
      },
    },
    convex: {
      name: "Convex polygons",
      realize(pts, labels) {
        const { pos, neg } = split(pts, labels);
        const h = hull(pos);
        if (h.length >= 3 && neg.some((q) => insideConvex(h, q))) return null;
        return (ctx) => {
          if (!h.length) return;
          ctx.beginPath();
          h.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
          ctx.closePath();
          ctx.lineWidth = 12; ctx.lineJoin = "round";
          ctx.strokeStyle = ctx.fillStyle;
          ctx.stroke(); ctx.fill();
        };
      },
    },
  };

  function drawScene(ctx, pts, labels, hyp) {
    ctx.clearRect(0, 0, W, H);
    if (hyp) { ctx.save(); ctx.fillStyle = "rgba(26,127,55,0.15)"; hyp(ctx); ctx.restore(); }
    pts.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, 2 * Math.PI);
      ctx.fillStyle = !labels ? "#57606a" : labels[i] ? "#1a7f37" : "#cf222e";
      ctx.fill();
    });
  }

  function mount(root) {
    root.innerHTML = `
      <div class="controls">
        <label>Hypothesis class:
          <select>${Object.entries(CLASSES).map(([k, c]) => `<option value="${k}">${c.name}</option>`).join("")}</select>
        </label>
        <button data-act="random">Random points</button>
        <button data-act="clear">Clear</button>
      </div>
      <canvas width="${W}" height="${H}"></canvas>
      <div>Click to add a point (up to ${MAX_POINTS}); click a point to remove it.
        <span style="color:#1a7f37">●</span> = +, <span style="color:#cf222e">●</span> = −,
        shaded region = a hypothesis that achieves the labeling.</div>
      <div class="status"></div>
      <div class="labelings"></div>`;
    const select = root.querySelector("select");
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const status = root.querySelector(".status");
    const grid = root.querySelector(".labelings");
    let pts = [];

    function update() {
      drawScene(ctx, pts, null, null);
      grid.innerHTML = "";
      const n = pts.length;
      if (!n) { status.textContent = "Place some points."; return; }
      const cls = CLASSES[select.value];
      let realized = 0;
      for (let mask = 0; mask < 1 << n; mask++) {
        const labels = pts.map((_, i) => !!(mask & (1 << i)));
        const hyp = cls.realize(pts, labels);
        if (hyp) realized++;
        const c = document.createElement("canvas");
        c.width = W * THUMB; c.height = H * THUMB;
        c.className = hyp ? "ok" : "bad";
        const tctx = c.getContext("2d");
        tctx.scale(THUMB, THUMB);
        drawScene(tctx, pts, labels, hyp);
        grid.append(c);
      }
      const total = 1 << n;
      status.textContent = realized === total
        ? `Shattered! All ${total} labelings of these ${n} points are realizable.`
        : `Not shattered: ${realized} of ${total} labelings are realizable.`;
    }

    canvas.addEventListener("click", (e) => {
      const r = canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) * W) / r.width, y = ((e.clientY - r.top) * H) / r.height;
      const hit = pts.findIndex((p) => Math.hypot(p.x - x, p.y - y) <= R + 3);
      if (hit >= 0) pts.splice(hit, 1);
      else if (pts.length < MAX_POINTS) pts.push({ x, y });
      update();
    });
    select.addEventListener("change", update);
    root.querySelector('[data-act="clear"]').onclick = () => { pts = []; update(); };
    root.querySelector('[data-act="random"]').onclick = () => {
      pts = Array.from({ length: 4 }, () => ({ x: 30 + Math.random() * (W - 60), y: 30 + Math.random() * (H - 60) }));
      update();
    };
    update();
  }

  document.querySelectorAll("[data-widget=shattering]").forEach(mount);
})();
